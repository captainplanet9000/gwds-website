-- Bind fulfillment to the checkout's Stripe mode and recorded session.
CREATE OR REPLACE FUNCTION public.activate_hosting_checkout(p_event_id text, p_event_type text, p_payload_hash text, p_subscription_id uuid, p_user_id uuid, p_plan_id text, p_checkout_session_id text, p_stripe_customer_id text, p_stripe_subscription_id text, p_stripe_price_id text, p_customer_email text, p_status text, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_trial_end timestamp with time zone, p_cancel_at_period_end boolean, p_livemode boolean)
 RETURNS TABLE(subscription_id uuid, instance_id uuid, processed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_claimed integer;
  v_subscription public.hosting_subscriptions%rowtype;
  v_plan public.hosting_plans%rowtype;
  v_instance_id uuid;
begin
  insert into public.stripe_events(stripe_event_id,event_type,livemode,payload_hash,status)
  values(p_event_id,p_event_type,p_livemode,p_payload_hash,'processing') on conflict(stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;
  if v_claimed=0 then
    IF NOT EXISTS(SELECT 1 FROM public.stripe_events WHERE stripe_event_id=p_event_id AND payload_hash=p_payload_hash AND livemode IS NOT DISTINCT FROM p_livemode) THEN RAISE EXCEPTION 'STRIPE_EVENT_REPLAY_MISMATCH'; END IF;
    select hi.id into v_instance_id from public.hosting_instances AS hi where hi.subscription_id=p_subscription_id;
    return query select p_subscription_id,v_instance_id,false; return;
  end if;

  select * into v_subscription from public.hosting_subscriptions where id=p_subscription_id for update;
  select * into v_plan from public.hosting_plans where id=p_plan_id;
  if v_subscription.id is null or v_plan.id is null then raise exception 'HOSTING_SUBSCRIPTION_NOT_FOUND'; end if;
  if v_subscription.user_id<>p_user_id or v_subscription.plan_id<>p_plan_id then raise exception 'HOSTING_OWNER_MISMATCH'; end if;
  if lower(v_subscription.customer_email)<>lower(p_customer_email) then raise exception 'HOSTING_EMAIL_MISMATCH'; end if;
  -- Checkout selected a mode-specific price. Fulfillment must use the same column;
  -- the deprecated shared price can contain an old test price or a live price.
  IF p_livemode IS NULL OR p_stripe_price_id IS NULL
    OR (CASE WHEN p_livemode THEN v_plan.stripe_price_id_live ELSE v_plan.stripe_price_id_test END)
      IS DISTINCT FROM p_stripe_price_id
    OR v_subscription.price_cents IS DISTINCT FROM v_plan.price_cents
    THEN RAISE EXCEPTION 'HOSTING_PRICE_MISMATCH'; END IF;
  IF p_checkout_session_id IS NULL OR v_subscription.stripe_checkout_session_id IS DISTINCT FROM p_checkout_session_id
    THEN RAISE EXCEPTION 'HOSTING_CHECKOUT_SESSION_MISMATCH'; END IF;
  IF v_subscription.stripe_subscription_id IS NOT NULL
    AND v_subscription.stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id
    THEN RAISE EXCEPTION 'HOSTING_STRIPE_SUBSCRIPTION_MISMATCH'; END IF;
  if p_status not in ('incomplete','trialing','active','past_due','unpaid','paused') then raise exception 'HOSTING_STATUS_INVALID'; end if;

  update public.hosting_subscriptions set
    stripe_checkout_session_id=p_checkout_session_id,stripe_customer_id=p_stripe_customer_id,
    stripe_subscription_id=p_stripe_subscription_id,status=p_status,livemode=p_livemode,
    current_period_start=p_period_start,current_period_end=p_period_end,trial_end=p_trial_end,
    cancel_at_period_end=coalesce(p_cancel_at_period_end,false),updated_at=now()
  where id=p_subscription_id;

  insert into public.hosting_onboarding(subscription_id,user_id,status)
  values(p_subscription_id,p_user_id,'customer_input') on conflict on constraint hosting_onboarding_subscription_id_key do nothing;
  insert into public.hosting_instances(subscription_id,user_id,plan_id,tenant_key,status)
  values(p_subscription_id,p_user_id,p_plan_id,'cival-'||replace(p_subscription_id::text,'-',''),'queued')
  on conflict on constraint hosting_instances_subscription_id_key do update set plan_id=excluded.plan_id,updated_at=now()
  returning id into v_instance_id;
  insert into public.hosting_provisioning_tasks(instance_id,task_type,status,priority,idempotency_key)
  values(v_instance_id,'review','queued',80,'initial-review-'||p_subscription_id::text) on conflict(idempotency_key) do nothing;
  insert into public.hosting_audit(user_id,subscription_id,instance_id,actor_type,actor_id,action,metadata)
  values(p_user_id,p_subscription_id,v_instance_id,'stripe',p_event_id,'hosting_subscription_activated',jsonb_build_object('status',p_status,'plan_id',p_plan_id));
  insert into public.hosting_notifications(subscription_id,template,recipient_email,dedup_key,payload)
  values(p_subscription_id,'hosting_started',lower(p_customer_email),'hosting-started-'||p_subscription_id::text,jsonb_build_object('plan_id',p_plan_id,'instance_id',v_instance_id))
  on conflict(dedup_key) do nothing;
  update public.stripe_events set status='completed',processed_at=now() where stripe_event_id=p_event_id;
  return query select p_subscription_id,v_instance_id,true;
end;
$function$;

REVOKE ALL ON FUNCTION public.activate_hosting_checkout(text,text,text,uuid,uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.activate_hosting_checkout(text,text,text,uuid,uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,boolean) TO service_role;
NOTIFY pgrst,'reload schema';
