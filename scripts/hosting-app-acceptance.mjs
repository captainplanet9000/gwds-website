import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { chromium } from 'playwright';
import { fillCard } from './stripe-checkout-browser.mjs';

process.loadEnvFile('C:/GWDS/launch-acceptance-20260926/commerce.private.env');
assert(process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'));
assert(['127.0.0.1','localhost'].includes(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname));
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
const baseUrl='http://127.0.0.1:3179';
const secret='whsec_'+randomBytes(32).toString('hex');
const fixtures=[], results=[];
let browser, server, logs='';
const sql=q=>execFileSync('docker',['exec','-i','supabase_db_launch-acceptance-20260926','psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-At'],{input:q,encoding:'utf8'}).trim();
async function post(path,token,body){const r=await fetch(baseUrl+path,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(body)});const value=await r.json();assert(r.ok,`${path}: ${r.status} ${JSON.stringify(value)}`);return value;}
async function webhook(type,object,id='evt_fixture_'+randomUUID().replaceAll('-','')){
 const payload=JSON.stringify({id,object:'event',type,created:Math.floor(Date.now()/1000),livemode:false,data:{object}});
 const t=Math.floor(Date.now()/1000), signature=createHmac('sha256',secret).update(t+'.'+payload).digest('hex');
 const r=await fetch(baseUrl+'/api/webhooks/stripe',{method:'POST',headers:{'content-type':'application/json','stripe-signature':`t=${t},v1=${signature}`},body:payload});
 assert(r.ok,`Webhook ${type}: ${r.status} ${await r.text()}`);
}
try {
 sql("UPDATE public.hosting_capacity SET max_subscriptions=50; INSERT INTO control.host_registry(host,admissions_enabled,max_tenants) VALUES('acceptance',true,50) ON CONFLICT(host) DO UPDATE SET admissions_enabled=true,max_tenants=50; INSERT INTO control.port_pool(host,lo,hi) VALUES('acceptance',9200,9250) ON CONFLICT DO NOTHING; NOTIFY pgrst,'reload schema';");
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3179'],{env:{...process.env,NEXT_PUBLIC_HOSTING_SALES_ENABLED:'true',HOSTING_AUTOMATION_ENABLED:'false',NEXT_PUBLIC_SITE_URL:baseUrl,STRIPE_WEBHOOK_SECRET:secret,WALLET_CHALLENGE_SECRET:randomBytes(32).toString('hex')},stdio:['ignore','pipe','pipe']});
 for(const stream of [server.stdout,server.stderr])stream.on('data',b=>{logs=(logs+b).slice(-7000)});
 for(let i=0;i<90;i++){try{if((await fetch(baseUrl)).ok)break;}catch{} await new Promise(r=>setTimeout(r,1000));}
 browser=await chromium.launch();const page=await browser.newPage();
 for(const [plan,amount] of [['solo',2900],['desk',7900],['fund',19900]]){
  if(process.env.ACCEPTANCE_PLAN && process.env.ACCEPTANCE_PLAN!==plan)continue;
  const item={plan};fixtures.push(item);
  item.product=await stripe.products.create({name:`Cival isolated ${plan} acceptance`});
  item.price=await stripe.prices.create({product:item.product.id,unit_amount:amount,currency:'usd',recurring:{interval:'month'}});
  const change=await db.from('hosting_plans').update({stripe_price_id:item.price.id,stripe_price_id_test:item.price.id,price_cents:amount,is_active:true,launch_ready:true}).eq('id',plan);assert.ifError(change.error);
  const email=`civallee4+hosting-${plan}-${Date.now()}@gmail.com`, password=randomBytes(24).toString('hex')+'aA1!';
  const user=await db.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(user.error);item.user=user.data.user.id;
  const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const login=await client.auth.signInWithPassword({email,password});assert.ifError(login.error);const token=login.data.session.access_token;
  const checkout=await post('/api/hosting/checkout',token,{planId:plan,acceptedTerms:true});item.internal=checkout.subscriptionId;
  await fillCard(page,checkout.stripeUrl,'4242424242424242',true,baseUrl,'/account/hosting');
  const row=await db.from('hosting_subscriptions').select('*').eq('id',item.internal).single();assert.ifError(row.error);
  const session=await stripe.checkout.sessions.retrieve(row.data.stripe_checkout_session_id);item.subscription=session.subscription;item.customer=session.customer;
  await webhook('checkout.session.completed',session);
  const state=await db.from('hosting_subscriptions').select('status').eq('id',item.internal).single();assert.equal(state.data.status,plan==='solo'?'trialing':'active');
  const owned=await client.from('hosting_subscriptions').select('id,user_id');assert.ifError(owned.error);assert.equal(owned.data.length,1);assert(owned.data.every(r=>r.user_id===item.user));
  const accountResponse=await fetch(baseUrl+'/api/hosting/account',{headers:{authorization:'Bearer '+token}});const account=await accountResponse.json();assert(accountResponse.ok,`Account read: ${JSON.stringify(account)}`);assert.equal(account.subscriptions.length,1);assert.equal(account.config.trialEligible,false);
  const portal=await post('/api/hosting/portal',token,{});assert.equal(new URL(portal.url).hostname,'billing.stripe.com');
  const placed=JSON.parse(sql(`SELECT row_to_json(t) FROM (SELECT id,host,status FROM control.tenants WHERE hosting_subscription_id='${item.internal}') t;`));
  assert.equal(placed.host,'acceptance');
  assert.equal(sql(`SELECT count(*) FROM control.tenant_commands WHERE tenant_id='${placed.id}' AND command='provision';`),'0');
  const wallet=privateKeyToAccount(generatePrivateKey());
  const challenge=await post('/api/account/funding/challenge',token,{address:wallet.address});
  const proof=await post('/api/account/funding/verify-wallet',token,{subscriptionId:item.internal,address:wallet.address,...challenge,signature:await wallet.signMessage({message:challenge.message})});assert.equal(proof.verified,true);
  const provisioning=await db.rpc('provision_hosting_tenant',{p_hosting_subscription_id:item.internal,p_plan:plan,p_owner_email:email,p_display_name:'Acceptance fixture',p_requested_by:'isolated-acceptance'});assert.ifError(provisioning.error);
  assert.equal(sql(`SELECT count(*) FROM control.tenant_commands WHERE tenant_id='${placed.id}' AND command='provision';`),'1');
  let failedRenewalRecovered=null;
  if(plan==='solo'){
   const declined=await stripe.paymentMethods.attach('pm_card_chargeCustomerFail',{customer:item.customer});
   const renewal=await stripe.subscriptions.update(item.subscription,{default_payment_method:declined.id,trial_end:'now'});
   let invoice=await stripe.invoices.retrieve(typeof renewal.latest_invoice==='string'?renewal.latest_invoice:renewal.latest_invoice.id);
   if(invoice.status==='draft')invoice=await stripe.invoices.finalizeInvoice(invoice.id);
   try { await stripe.invoices.pay(invoice.id);throw Error('Declined renewal unexpectedly succeeded'); }
   catch(error){assert.equal(error.code,'card_declined');}
   invoice=await stripe.invoices.retrieve(invoice.id);
   assert.equal((await stripe.subscriptions.retrieve(item.subscription)).status,'past_due');
   await webhook('invoice.payment_failed',invoice);
   assert.equal((await db.from('hosting_subscriptions').select('status').eq('id',item.internal).single()).data.status,'past_due');
   assert.equal(sql(`SELECT count(*) FROM control.tenant_commands WHERE tenant_id='${placed.id}' AND command='suspend';`),'1');
   assert.equal(sql(`SELECT count(*) FROM public.hosting_notifications WHERE subscription_id='${item.internal}' AND template='hosting_payment_failed' AND status='sent';`),'1');
   const replacement=await stripe.paymentMethods.attach('pm_card_visa',{customer:item.customer});
   await stripe.subscriptions.update(item.subscription,{default_payment_method:replacement.id});
   invoice=await stripe.invoices.pay(invoice.id,{payment_method:replacement.id});
   assert.equal(invoice.status,'paid');assert.equal(invoice.amount_paid,amount);
   await webhook('invoice.paid',invoice);
   assert.equal((await db.from('hosting_subscriptions').select('status').eq('id',item.internal).single()).data.status,'active');
   // Provision has not completed in this harness, so resume is deliberately
   // deferred. The real host command must skip the now-obsolete suspension.
   assert.equal(sql(`SELECT count(*) FROM control.tenant_commands WHERE tenant_id='${placed.id}' AND command='resume';`),'0');
   const worker=execFileSync(process.execPath,['--import','file:///C:/GWDS/hosting/services/tenant-runner/loader.mjs','C:/GWDS/hosting/scripts/verify-stale-billing-command.mjs'],{encoding:'utf8',env:{...process.env,ACCEPTANCE_DATABASE_URL:'postgres://postgres:postgres@127.0.0.1:55622/postgres',ACCEPTANCE_TENANT_ID:placed.id}});
   assert.equal(JSON.parse(worker.trim()).staleBillingSuspensionSkipped,true);
   assert.equal(sql(`SELECT count(*) FROM control.tenant_commands WHERE tenant_id='${placed.id}' AND command='unhalt';`),'0');
   failedRenewalRecovered=true;
  }
  const canceled=await stripe.subscriptions.cancel(item.subscription);await webhook('customer.subscription.deleted',canceled);
  const ended=await db.from('hosting_subscriptions').select('status').eq('id',item.internal).single();assert.equal(ended.data.status,'canceled');
  await webhook('checkout.session.completed',session);
  const delayed=await db.from('hosting_subscriptions').select('status').eq('id',item.internal).single();assert.equal(delayed.data.status,'canceled');
  results.push({plan,checkout:true,billingState:state.data.status,ownerIsolation:true,accountReadable:true,repeatTrialIneligible:true,billingPortal:true,walletProof:true,awaitingWalletBeforeProof:true,oneProvisionCommandAfterProof:true,failedRenewalRecovered,cancellation:true,delayedCheckoutCannotReactivate:true});
  console.log(JSON.stringify(results.at(-1)));
 }
} catch(e){
 fs.writeFileSync('C:/GWDS/launch-acceptance-20260926/hosting-app-failure.private.log',logs);
 console.error(String(e));process.exitCode=1;
} finally {
 await browser?.close();server?.kill();
 for(const f of fixtures){
  if(f.subscription)await stripe.subscriptions.cancel(f.subscription).catch(()=>{});
  if(f.price)await stripe.prices.update(f.price.id,{active:false}).catch(()=>{});
  if(f.product)await stripe.products.update(f.product.id,{active:false}).catch(()=>{});
 }
 const report={at:new Date().toISOString(),passed:!process.exitCode,results,scope:'Real Stripe sandbox Checkout and application routes against isolated local database. Webhooks signed locally; test wallets newly generated and unfunded. Provision command verified, host execution not exercised. Local fixture rows retained for inspection.'};
 fs.writeFileSync(`C:/GWDS/artifacts/hosting-app-acceptance${process.env.ACCEPTANCE_PLAN?'-'+process.env.ACCEPTANCE_PLAN:''}-20260928.json`,JSON.stringify(report,null,2));
}


