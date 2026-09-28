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
  sql(readFileSync(new URL('../supabase/migrations/20260928043155_reconcile_delayed_hosting_activation.sql',import.meta.url),'utf8'));
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
  sql(`
DO $$ DECLARE v_id uuid; v_status text; v_plan text; rejected boolean; BEGIN
 UPDATE hosting_plans SET stripe_price_id_test='price_test' WHERE id='solo';
 INSERT INTO hosting_plans SELECT 'desk',7900,'old','price_test_desk','price_live_desk';
 INSERT INTO hosting_plans SELECT 'fund',19900,'old','price_test_fund','price_live_fund';
 FOREACH v_plan IN ARRAY ARRAY['solo','desk','fund'] LOOP
  FOREACH v_status IN ARRAY ARRAY['active','trialing','canceled','incomplete_expired','past_due','unpaid','paused','incomplete'] LOOP
   v_id=gen_random_uuid();
   INSERT INTO hosting_subscriptions(id,user_id,plan_id,customer_email,price_cents,stripe_checkout_session_id,status)
   SELECT v_id,'11111111-1111-4111-8111-111111111111',id,'fixture@example.invalid',price_cents,'cs_'||v_id,'pending_checkout' FROM hosting_plans WHERE id=v_plan;
   PERFORM * FROM activate_hosting_checkout('evt_'||v_id,'checkout.session.completed','hash',v_id,
    '11111111-1111-4111-8111-111111111111',v_plan,'cs_'||v_id,'cus_fixture','sub_'||v_id,
    (SELECT stripe_price_id_test FROM hosting_plans WHERE id=v_plan),'fixture@example.invalid',v_status,
    now(),now()+interval '1 month',null,false,false);
   IF (SELECT status FROM hosting_subscriptions WHERE id=v_id)<>v_status THEN RAISE EXCEPTION 'Wrong billing state'; END IF;
   IF v_status IN ('active','trialing') THEN
    IF NOT EXISTS(SELECT 1 FROM hosting_instances WHERE subscription_id=v_id) THEN RAISE EXCEPTION 'Paid plan missing instance'; END IF;
   ELSE
    IF EXISTS(SELECT 1 FROM hosting_instances WHERE subscription_id=v_id) THEN RAISE EXCEPTION 'Inactive checkout provisioned'; END IF;
    IF EXISTS(SELECT 1 FROM hosting_notifications WHERE subscription_id=v_id) THEN RAISE EXCEPTION 'Inactive checkout sent start email'; END IF;
   END IF;
   IF v_status IN ('canceled','incomplete_expired') THEN
    rejected=false;
    BEGIN
     PERFORM * FROM activate_hosting_checkout('evt_stale_'||v_id,'checkout.session.completed','hash2',v_id,
      '11111111-1111-4111-8111-111111111111',v_plan,'cs_'||v_id,'cus_fixture','sub_'||v_id,
      (SELECT stripe_price_id_test FROM hosting_plans WHERE id=v_plan),'fixture@example.invalid','active',now(),now()+interval '1 month',null,false,false);
    EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'HOSTING_TERMINAL_STATE_CONFLICT' THEN RAISE; END IF; rejected=true; END;
    IF NOT rejected THEN RAISE EXCEPTION 'Terminal subscription reactivated'; END IF;
   END IF;
  END LOOP;
 END LOOP;
END $$;
  `);
  console.log('PASS: all three plans across eight billing states; inactive checkout never provisions; terminal states reject stale activation; test/live prices, replay, rollback and customer execution denial.');
} finally {
  sql(`DROP DATABASE IF EXISTS ${database};`,'postgres');
}
