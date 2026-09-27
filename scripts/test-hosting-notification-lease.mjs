import {execFileSync,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const container='cival-hosting-launch-acceptance',database='email_acceptance_'+crypto.randomBytes(5).toString('hex');
const args=['exec','-i',container,'psql','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-At'];
const run=sql=>execFileSync('docker',args,{input:sql,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const query=async sql=>(await promisify(execFile)('docker',[...args,'-c',sql])).stdout.trim();
const id=crypto.randomUUID(),stale=crypto.randomUUID();
const payload=JSON.stringify({to:'test@example.invalid',from:'noreply@example.invalid',subject:'Original',html:'<p>Original</p>',text:'Original'});
(async()=>{execFileSync('docker',['exec',container,'createdb','-U','postgres',database]);try{
run(`CREATE TABLE public.hosting_notifications(id uuid PRIMARY KEY,subscription_id uuid,template text,recipient_email text,dedup_key text,payload jsonb DEFAULT '{}',status text DEFAULT 'pending',attempts integer DEFAULT 0,provider_message_id text,last_error text,created_at timestamptz DEFAULT now(),sent_at timestamptz); ALTER TABLE public.hosting_notifications ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.hosting_notifications FROM PUBLIC,anon,authenticated; GRANT ALL ON public.hosting_notifications TO service_role;`);
run(fs.readFileSync('supabase/migrations/20260927034759_durable_hosting_notifications.sql','utf8'));
run(`INSERT INTO public.hosting_notifications(id,recipient_email) VALUES('${id}','test@example.invalid'),('${stale}','test@example.invalid');`);
const claim=`SELECT public.claim_hosting_notification('${id}','${payload}'::jsonb);`;
const raced=await Promise.all(Array.from({length:8},()=>query('SET ROLE service_role; '+claim)));
const claims=raced.map(value=>value.split('\n').find(line=>line.startsWith('{'))).filter(Boolean).map(JSON.parse);assert.equal(claims.length,1);
const first=claims[0];run(`UPDATE public.hosting_notifications SET lease_expires_at=now()-interval '1 second' WHERE id='${id}';`);
const second=JSON.parse(run(`SELECT public.claim_hosting_notification('${id}','${payload.replaceAll('Original','Changed')}');`));assert.notEqual(second.lease_token,first.lease_token);assert.equal(second.prepared_email.subject,'Original');
assert.throws(()=>run(`SELECT public.finish_hosting_notification('${id}','${first.lease_token}','old-provider',NULL);`));
assert.equal(run(`SELECT public.finish_hosting_notification('${id}','${second.lease_token}','provider-id',NULL);`),'t');assert.equal(run(`SELECT delivery_status FROM public.hosting_notifications WHERE id='${id}';`),'submitted');assert.equal(run(claim),'');
run(`UPDATE public.hosting_notifications SET status='sending',attempts=1,prepared_email='${payload}',first_attempt_at=now()-interval '25 hours',lease_expires_at=now()-interval '24 hours' WHERE id='${stale}';`);
assert.equal(run(`SELECT public.claim_hosting_notification('${stale}','${payload}');`),'');assert.equal(run(`SELECT requires_review FROM public.hosting_notifications WHERE id='${stale}';`),'t');
assert.throws(()=>run(`SET ROLE authenticated; ${claim}`));
const report={at:new Date().toISOString(),checks:['eight workers obtain one send lease','expired lease recovers exact frozen message','superseded worker cannot acknowledge','provider acceptance recorded separately from delivery','expired provider idempotency window requires review','browser role cannot claim sends'],externalEmailsSent:0};
fs.writeFileSync('notification-acceptance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{execFileSync('docker',['exec',container,'dropdb','-U','postgres',database]);}})().catch(e=>{console.error(e.message);process.exitCode=1});

