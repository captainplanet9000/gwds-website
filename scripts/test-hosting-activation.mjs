import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

// A disposable LOCAL database. Never connects to production or Stripe.
const container='cival-hosting-launch-acceptance';
const database='activation_'+randomUUID().replaceAll('-','');
const sql=(text,db=database)=>execFileSync('docker',['exec','-i',container,'psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d',db,'-At'],{input:text,encoding:'utf8',stdio:['pipe','pipe','pipe']});
try {
  sql(`CREATE DATABASE ${database};`,'postgres');
  sql(`
CREATE TABLE hosting_plans(id text PRIMARY KEY,price_cents integer,stripe_price_id text,stripe_price_id_test text,stripe_price_id_live text);
CREATE TABLE hosting_subscriptions(id uuid PRIMARY KEY,user_id uuid,plan_id text,customer_email text,price_cents integer,stripe_checkout_session_id text,stripe_customer_id text,stripe_subscription_id text,status text,livemode boolean,current_period_start timestamptz,current_period_end timestamptz,trial_end timestamptz,cancel_at_period_end boolean,updated_at timestamptz);
CREATE TABLE stripe_events(stripe_event_id text PRIMARY KEY,event_type text,livemode boolean,payload_hash text,status text,processed_at timestamptz);
CREATE TABLE hosting_onboarding(subscription_id uuid CONSTRAINT hosting_onboarding_subscription_id_key UNIQUE,user_id uuid,status text);
CREATE TABLE hosting_instances(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,subscription_id uuid CONSTRAINT hosting_instances_subscription_id_key UNIQUE,user_id uuid,plan_id text,tenant_key text,status text,updated_at timestamptz);
CREATE TABLE hosting_provisioning_tasks(instance_id uuid,task_type text,status text,priority integer,idempotency_key text UNIQUE);
CREATE TABLE hosting_audit(user_id uuid,subscription_id uuid,instance_id uuid,actor_type text,actor_id text,action text,metadata jsonb);
CREATE TABLE hosting_notifications(subscription_id uuid,template text,recipient_email text,dedup_key text UNIQUE,payload jsonb);
INSERT INTO hosting_plans VALUES ('solo',2900,'deprecated-do-not-use','price_test','price_live');
  `);
  sql(readFileSync(new URL('../supabase/migrations/20260920075940_bind_hosting_activation_price_mode.sql',import.meta.url),'utf8'));
  sql(`
CREATE FUNCTION pg_temp.activate(p_id uuid,p_price text,p_live boolean,p_session text DEFAULT 'cs_fixture',p_hash text DEFAULT 'fixture-hash') RETURNS void LANGUAGE sql AS $$
 SELECT * FROM activate_hosting_checkout('evt_'||p_id,'checkout.session.completed',p_hash,p_id,
 '11111111-1111-4111-8111-111111111111','solo',p_session,'cus_fixture','sub_'||p_id,p_price,
 'fixture@example.invalid','trialing',now(),now()+interval '7 days',now()+interval '7 days',false,p_live);
$$;
DO $$ DECLARE v_id uuid; price text; live boolean; rejected boolean; result integer; BEGIN
 FOR live IN SELECT unnest(ARRAY[false,true]) LOOP
  v_id=gen_random_uuid();price=CASE WHEN live THEN 'price_live' ELSE 'price_test' END;
  INSERT INTO hosting_subscriptions(id,user_id,plan_id,customer_email,price_cents,stripe_checkout_session_id,status)
    VALUES(v_id,'11111111-1111-4111-8111-111111111111','solo','fixture@example.invalid',2900,'cs_fixture','pending_checkout');
  PERFORM pg_temp.activate(v_id,price,live);
  PERFORM pg_temp.activate(v_id,price,live);
  SELECT count(*) INTO result FROM hosting_instances WHERE subscription_id=v_id;
  IF result<>1 THEN RAISE EXCEPTION 'Replay duplicated instance'; END IF;
  SELECT count(*) INTO result FROM hosting_audit WHERE subscription_id=v_id;
  IF result<>1 THEN RAISE EXCEPTION 'Replay duplicated activation'; END IF;
  rejected=false;
  BEGIN PERFORM pg_temp.activate(v_id,price,live,'cs_fixture','changed-payload'); EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'STRIPE_EVENT_REPLAY_MISMATCH' THEN RAISE; END IF; rejected=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Conflicting replay accepted'; END IF;
 END LOOP;
 FOR result IN 1..5 LOOP
  v_id=gen_random_uuid();
  INSERT INTO hosting_subscriptions(id,user_id,plan_id,customer_email,price_cents,stripe_checkout_session_id,status)
    VALUES(v_id,'11111111-1111-4111-8111-111111111111','solo','fixture@example.invalid',2900,'cs_fixture','pending_checkout');
  rejected=false;
  BEGIN
    CASE result
      WHEN 1 THEN PERFORM pg_temp.activate(v_id,'price_live',false);
      WHEN 2 THEN PERFORM pg_temp.activate(v_id,NULL,false);
      WHEN 3 THEN PERFORM pg_temp.activate(v_id,'price_test',NULL);
      WHEN 4 THEN PERFORM pg_temp.activate(v_id,'price_test',false,'cs_wrong');
      WHEN 5 THEN UPDATE hosting_plans SET stripe_price_id_test=NULL WHERE id='solo';PERFORM pg_temp.activate(v_id,'price_test',false);
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT IN ('HOSTING_PRICE_MISMATCH','HOSTING_CHECKOUT_SESSION_MISMATCH') THEN RAISE; END IF; rejected=true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'Invalid activation accepted: %',result; END IF;
  IF EXISTS(SELECT 1 FROM stripe_events WHERE stripe_event_id='evt_'||v_id) THEN RAISE EXCEPTION 'Failed activation consumed event'; END IF;
 END LOOP;
 IF has_function_privilege('authenticated','public.activate_hosting_checkout(text,text,text,uuid,uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,boolean)','EXECUTE') THEN RAISE EXCEPTION 'Customer may activate billing'; END IF;
END $$;
  `);
  console.log('PASS: test/live prices, stale legacy column, duplicate replay, conflicting replay, null/mismatched prices, wrong session, rollback and customer execution denial.');
} finally {
  sql(`DROP DATABASE IF EXISTS ${database};`,'postgres');
}
