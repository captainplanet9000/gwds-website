import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import Stripe from 'stripe';
process.loadEnvFile('.env.production.local');
const env=Object.fromEntries(Object.entries(process.env).map(([k,v])=>[k,v?.trim()]));
const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const stripe=new Stripe(env.STRIPE_SECRET_KEY);
const root='C:/GWDS/selfhost-release-20260918/source-release-20260928/';
const manifest=JSON.parse(fs.readFileSync(root+'archives.json','utf8'));
const report={at:new Date().toISOString(),scope:manifest.scope,products:[]};
const hash=b=>createHash('sha256').update(b).digest('hex');
const {data:before,error}=await db.from('products').select('*').in('id',manifest.archives.map(a=>a.productId));
if(error||before.length!==8)throw Error('Catalog preflight failed');
fs.writeFileSync(root+'catalog-before.private.json',JSON.stringify(before,null,2));
for(const a of manifest.archives){
 const row=before.find(r=>r.id===a.productId); const price=await stripe.prices.retrieve(row.stripe_price_id_live);
 if(!price.active||!price.livemode||price.currency!=='usd'||price.unit_amount!==row.price_cents)throw Error('Live price mismatch: '+a.productId);
 const bytes=fs.readFileSync(root+a.file);if(hash(bytes)!==a.sha256||bytes.length!==a.bytes)throw Error('Local archive mismatch');
 const path='source/20260928/'+a.file;
 const uploaded=await db.storage.from('downloads').upload(path,bytes,{contentType:'application/zip',upsert:false});
 if(uploaded.error&&!/already exists|duplicate/i.test(uploaded.error.message))throw Error('Upload failed '+a.productId+': '+uploaded.error.message);
 const downloaded=await db.storage.from('downloads').download(path);if(downloaded.error)throw Error('Remote download failed');
 const remote=Buffer.from(await downloaded.data.arrayBuffer());if(hash(remote)!==a.sha256||remote.length!==a.bytes)throw Error('Remote hash mismatch');
 report.products.push({...a,artifact_path:path,livePriceVerified:true,remoteHashVerified:true});
}
fs.writeFileSync(root+'publication-report.json',JSON.stringify(report,null,2));
if(process.argv.includes('--register')){
 for(const a of report.products){
  const {error}=await db.from('products').update({artifact_path:a.artifact_path,artifact_sha256:a.sha256,artifact_size_bytes:a.bytes,artifact_ready:true,is_active:true,version:a.version,updated_at:new Date().toISOString()}).eq('id',a.productId);
  if(error)throw Error('Registration failed: '+a.productId);
 }
 report.registered=true;fs.writeFileSync(root+'publication-report.json',JSON.stringify(report,null,2));
}
console.log(JSON.stringify({verified:report.products.length,registered:!!report.registered,products:report.products.map(a=>({id:a.productId,bytes:a.bytes,sha256:a.sha256}))},null,2));
