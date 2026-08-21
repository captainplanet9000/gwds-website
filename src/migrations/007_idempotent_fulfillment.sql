-- Make fulfillment idempotent across different Stripe success event types and
-- require the event's product snapshot to match the checkout created in Postgres.

create or replace function public.fulfill_store_order(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_order_id uuid,
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_user_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_total_cents integer,
  p_currency text,
  p_livemode boolean,
  p_items jsonb
)
returns table(order_id uuid, processed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claimed integer;
  v_order public.orders%rowtype;
  v_item record;
  v_item_count integer;
begin
  insert into public.stripe_events
    (stripe_event_id, event_type, livemode, payload_hash, status, order_id)
  values
    (p_event_id, p_event_type, p_livemode, p_payload_hash, 'processing', p_order_id)
  on conflict (stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;

  if v_claimed = 0 then
    return query select p_order_id, false;
    return;
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.stripe_session_id <> p_stripe_session_id then raise exception 'SESSION_MISMATCH'; end if;
  if lower(v_order.customer_email) <> lower(p_customer_email) then raise exception 'EMAIL_MISMATCH'; end if;
  if v_order.user_id is distinct from p_user_id then raise exception 'USER_MISMATCH'; end if;
  if v_order.total_cents <> p_total_cents then raise exception 'AMOUNT_MISMATCH'; end if;
  if lower(p_currency) <> 'usd' then raise exception 'CURRENCY_MISMATCH'; end if;
  if nullif(p_payment_intent_id, '') is null then raise exception 'PAYMENT_INTENT_MISSING'; end if;

  -- Stripe can emit both checkout.session.completed and
  -- checkout.session.async_payment_succeeded for one order. Side effects must
  -- run once per order, not once per event ID.
  if v_order.status = 'paid' and v_order.fulfillment_status = 'fulfilled' then
    update public.stripe_events
    set status = 'completed', order_id = p_order_id, processed_at = now()
    where stripe_event_id = p_event_id;
    return query select p_order_id, false;
    return;
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'ORDER_ITEMS_MISSING';
  end if;

  select count(*) into v_item_count
  from public.order_items
  where public.order_items.order_id = p_order_id;
  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'ORDER_ITEMS_MISMATCH';
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_items)
      as x(product_id text, quantity integer, price_cents integer, stripe_price_id text, product_version text)
  loop
    if not exists (
      select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = p_order_id
        and oi.product_id = v_item.product_id
        and oi.quantity = v_item.quantity
        and oi.price_cents = v_item.price_cents
        and oi.stripe_price_id is not distinct from v_item.stripe_price_id
        and oi.product_version is not distinct from v_item.product_version
        and p.is_active = true
    ) then
      raise exception 'ORDER_ITEMS_MISMATCH';
    end if;
  end loop;

  update public.orders
  set status = 'paid',
      fulfillment_status = 'fulfilled',
      payment_intent_id = p_payment_intent_id,
      currency = lower(p_currency),
      livemode = p_livemode,
      paid_at = coalesce(paid_at, now()),
      failure_reason = null,
      updated_at = now()
  where id = p_order_id;

  insert into public.entitlements
    (user_id, product_id, source_order_item_id, status, updates_until)
  select p_user_id, oi.product_id, oi.id, 'active', now() + interval '1 year'
  from public.order_items oi
  where oi.order_id = p_order_id
  on conflict (source_order_item_id) do update
    set status = 'active', revoked_at = null, revoke_reason = null;

  insert into public.customers
    (email, name, user_id, total_spent, order_count, first_order_at, last_order_at, marketing_consent, updated_at)
  values
    (lower(p_customer_email), coalesce(p_customer_name, ''), p_user_id,
     p_total_cents / 100.0, 1, now(), now(), v_order.marketing_consent, now())
  on conflict (lower(email)) do update
    set name = case when excluded.name <> '' then excluded.name else public.customers.name end,
        user_id = coalesce(public.customers.user_id, excluded.user_id),
        total_spent = coalesce(public.customers.total_spent, 0) + excluded.total_spent,
        order_count = coalesce(public.customers.order_count, 0) + 1,
        first_order_at = coalesce(public.customers.first_order_at, now()),
        last_order_at = now(),
        marketing_consent = public.customers.marketing_consent or excluded.marketing_consent,
        updated_at = now();

  if v_order.coupon_code is not null then
    update public.gwds_coupons
    set used_count = coalesce(used_count, 0) + 1, updated_at = now()
    where code = v_order.coupon_code;
  end if;

  if v_order.marketing_consent then
    insert into public.newsletter_subscribers (email, source, is_active, subscribed_at)
    values (lower(p_customer_email), 'purchase_opt_in', true, now())
    on conflict (email) do update
      set is_active = true, unsubscribed_at = null;
  end if;

  insert into public.email_outbox (order_id, template, recipient_email, payload)
  values (p_order_id, 'order_confirmation', lower(p_customer_email), jsonb_build_object('order_id', p_order_id))
  on conflict (order_id, template) do nothing;

  update public.stripe_events
  set status = 'completed', order_id = p_order_id, processed_at = now()
  where stripe_event_id = p_event_id;

  return query select p_order_id, true;
end;
$$;

revoke all on function public.fulfill_store_order(text,text,text,uuid,text,text,uuid,text,text,integer,text,boolean,jsonb)
  from public, anon, authenticated;
grant execute on function public.fulfill_store_order(text,text,text,uuid,text,text,uuid,text,text,integer,text,boolean,jsonb)
  to service_role;
