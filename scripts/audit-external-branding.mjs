// Read-only account branding audit. Never prints credentials or customer records.
import Stripe from 'stripe';
const legacy=/gwds|gamma\s*waves/i;
const report={};
const sender=process.env.RESEND_FROM_EMAIL;
report.emailSender={configured:!!sender,legacyDisplayName:!!sender&&legacy.test(sender.split('<')[0]),legacyMailbox:!!sender&&legacy.test(sender.match(/<([^<>]+)>/)?.[1]??sender)};
if(process.env.STRIPE_SECRET_KEY){
 try{
  const account=await new Stripe(process.env.STRIPE_SECRET_KEY).accounts.retrieve();
  const values={businessName:account.business_profile?.name,businessUrl:account.business_profile?.url,statementDescriptor:account.settings?.payments?.statement_descriptor,dashboardDisplayName:account.settings?.dashboard?.display_name};
  report.stripe={verified:true,...values,legacyFields:Object.entries(values).filter(([,v])=>typeof v==='string'&&legacy.test(v)).map(([k])=>k)};
 }catch(e){report.stripe={verified:false,error:e.code||e.type||'API_ERROR'};}
}else report.stripe={verified:false,reason:'Configured Stripe key unavailable to local audit'};
console.log(JSON.stringify(report,null,2));
