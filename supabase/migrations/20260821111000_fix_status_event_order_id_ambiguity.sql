-- The function returns a column named order_id and also updates table columns
-- named order_id. Prefer SQL columns so refund, dispute, and expiration events
-- cannot fail with a PL/pgSQL ambiguity error.

create or replace function public.apply_store_order_status_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_livemode boolean,
  p_status text,
  p_reason text,
  p_revoke boolean
)
returns table(order_id uuid, processed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_order_id uuid;
  v_claimed integer;
begin
  select id into v_order_id
  from public.orders
  where (p_stripe_session_id is not null and stripe_session_id = p_stripe_session_id)
     or (p_payment_intent_id is not null and payment_intent_id = p_payment_intent_id)
  order by created_at desc
  limit 1
  for update;

  if v_order_id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  insert into public.stripe_events
    (stripe_event_id, event_type, livemode, payload_hash, status, order_id)
  values
    (p_event_id, p_event_type, p_livemode, p_payload_hash, 'processing', v_order_id)
  on conflict (stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;

  if v_claimed = 0 then
    return query select v_order_id, false;
    return;
  end if;

  update public.orders
  set status = p_status,
      fulfillment_status = case when p_revoke then 'revoked' else fulfillment_status end,
      failure_reason = p_reason,
      updated_at = now()
  where id = v_order_id;

  if p_revoke then
    update public.entitlements e
    set status = 'revoked', revoked_at = now(), revoke_reason = p_reason
    from public.order_items oi
    where oi.id = e.source_order_item_id and oi.order_id = v_order_id;

    update public.downloads
    set revoked_at = now(), updated_at = now()
    where order_id = v_order_id and revoked_at is null;
  end if;

  update public.stripe_events
  set status = 'completed', processed_at = now()
  where stripe_event_id = p_event_id;

  return query select v_order_id, true;
end;
$$;

revoke all on function public.apply_store_order_status_event(text,text,text,text,text,boolean,text,text,boolean)
  from public, anon, authenticated;
grant execute on function public.apply_store_order_status_event(text,text,text,text,text,boolean,text,text,boolean)
  to service_role;
