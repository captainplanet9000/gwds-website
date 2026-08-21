-- Cival Systems atomic checkout creation
-- Keeps prices, product readiness, coupons, the order, and its line items in one
-- database transaction. Only the server-side service role may call this RPC.

create or replace function public.create_store_checkout(
  p_user_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_coupon_code text,
  p_terms_version text,
  p_refund_policy_version text,
  p_disclaimer_version text,
  p_marketing_consent boolean,
  p_items jsonb
)
returns table(
  order_id uuid,
  subtotal_cents integer,
  discount_cents integer,
  total_cents integer,
  coupon_code text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_item record;
  v_product public.products%rowtype;
  v_coupon public.gwds_coupons%rowtype;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_eligible integer := 0;
  v_count integer;
  v_code text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
begin
  if p_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_customer_email is null or length(trim(p_customer_email)) > 320 then
    raise exception 'INVALID_EMAIL';
  end if;
  if p_terms_version is null or p_refund_policy_version is null or p_disclaimer_version is null then
    raise exception 'LEGAL_ACCEPTANCE_REQUIRED';
  end if;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_ITEMS';
  end if;

  v_count := jsonb_array_length(p_items);
  if v_count < 1 or v_count > 12 then
    raise exception 'INVALID_ITEM_COUNT';
  end if;
  if (
    select count(distinct x.product_id)
    from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  ) <> v_count then
    raise exception 'DUPLICATE_PRODUCT';
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_items)
      as x(product_id text, quantity integer)
  loop
    if v_item.product_id is null or v_item.quantity <> 1 then
      raise exception 'INVALID_ITEM';
    end if;

    select * into v_product
    from public.products
    where id = v_item.product_id
      and is_active = true
    for share;

    if v_product.id is null then
      raise exception 'PRODUCT_UNAVAILABLE:%', v_item.product_id;
    end if;
    if not v_product.artifact_ready
       or v_product.artifact_path is null
       or v_product.artifact_sha256 is null
       or coalesce(v_product.artifact_size_bytes, 0) <= 0 then
      raise exception 'ARTIFACT_NOT_READY:%', v_item.product_id;
    end if;
    if v_product.stripe_price_id is null or v_product.price_cents < 50 then
      raise exception 'PRODUCT_NOT_CONFIGURED:%', v_item.product_id;
    end if;

    v_subtotal := v_subtotal + v_product.price_cents;
  end loop;

  if v_code is not null then
    select * into v_coupon
    from public.gwds_coupons
    where code = v_code
    for update;

    if v_coupon.id is null or not coalesce(v_coupon.is_active, false) then
      raise exception 'INVALID_COUPON';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at <= now() then
      raise exception 'COUPON_EXPIRED';
    end if;
    if v_coupon.max_uses is not null and coalesce(v_coupon.used_count, 0) >= v_coupon.max_uses then
      raise exception 'COUPON_LIMIT_REACHED';
    end if;
    if v_subtotal < round(coalesce(v_coupon.min_order, 0) * 100)::integer then
      raise exception 'COUPON_MINIMUM_NOT_MET';
    end if;

    select coalesce(sum(p.price_cents), 0)::integer into v_eligible
    from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
    join public.products p on p.id = x.product_id
    where (v_coupon.applies_to is null or cardinality(v_coupon.applies_to) = 0 or p.id = any(v_coupon.applies_to))
      and (v_coupon.excludes is null or cardinality(v_coupon.excludes) = 0 or not (p.id = any(v_coupon.excludes)));

    if v_eligible <= 0 then
      raise exception 'COUPON_NOT_APPLICABLE';
    end if;

    if v_coupon.discount_type = 'percentage' then
      if v_coupon.discount_value <= 0 or v_coupon.discount_value > 100 then
        raise exception 'INVALID_COUPON_CONFIGURATION';
      end if;
      v_discount := round(v_eligible * v_coupon.discount_value / 100)::integer;
    elsif v_coupon.discount_type = 'fixed' then
      if v_coupon.discount_value <= 0 then
        raise exception 'INVALID_COUPON_CONFIGURATION';
      end if;
      v_discount := least(v_eligible, round(v_coupon.discount_value * 100)::integer);
    else
      raise exception 'INVALID_COUPON_CONFIGURATION';
    end if;
  end if;

  if v_subtotal - v_discount < 50 then
    raise exception 'TOTAL_BELOW_STRIPE_MINIMUM';
  end if;

  insert into public.orders (
    id, stripe_session_id, customer_email, customer_name, user_id,
    subtotal_cents, discount_cents, total_cents, coupon_code,
    status, fulfillment_status, currency,
    terms_version, refund_policy_version, disclaimer_version,
    marketing_consent, updated_at
  ) values (
    v_order_id, 'pending:' || v_order_id::text, lower(trim(p_customer_email)),
    nullif(left(trim(coalesce(p_customer_name, '')), 120), ''), p_user_id,
    v_subtotal, v_discount, v_subtotal - v_discount, v_code,
    'checkout_pending', 'pending', 'usd',
    p_terms_version, p_refund_policy_version, p_disclaimer_version,
    coalesce(p_marketing_consent, false), now()
  );

  insert into public.order_items (
    order_id, product_id, quantity, price_cents, stripe_price_id, product_version
  )
  select
    v_order_id, p.id, 1, p.price_cents, p.stripe_price_id, p.version
  from jsonb_to_recordset(p_items) as x(product_id text, quantity integer)
  join public.products p on p.id = x.product_id;

  return query
  select v_order_id, v_subtotal, v_discount, v_subtotal - v_discount, v_code;
end;
$$;

revoke all on function public.create_store_checkout(uuid,text,text,text,text,text,text,boolean,jsonb)
  from public, anon, authenticated;
grant execute on function public.create_store_checkout(uuid,text,text,text,text,text,text,boolean,jsonb)
  to service_role;
