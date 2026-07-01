create sequence if not exists public.order_code_seq;

create or replace function public.create_order_v1(
  p_checkout_idempotency_key text,
  p_public_token_hash text,
  p_customer_key_hash text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_phone_normalized text,
  p_customer_email text,
  p_customer_email_normalized text,
  p_privacy_terms_version text,
  p_shipping_method text,
  p_address jsonb,
  p_coupon_code text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.orders%rowtype;
  v_settings public.store_settings%rowtype;
  v_order public.orders%rowtype;
  v_coupon public.coupons%rowtype;
  v_item jsonb;
  v_piece jsonb;
  v_variant record;
  v_kit_rule public.kit_rules%rowtype;
  v_quantity integer;
  v_unit_price integer;
  v_subtotal bigint := 0;
  v_discount bigint := 0;
  v_shipping integer;
  v_total bigint;
  v_reserved integer;
  v_redemptions integer;
  v_customer_redemptions integer;
  v_order_status text;
  v_expires_at timestamptz;
begin
  if nullif(btrim(p_checkout_idempotency_key), '') is null
    or nullif(btrim(p_public_token_hash), '') is null
    or nullif(btrim(p_customer_key_hash), '') is null then
    raise exception 'invalid_checkout_identity' using errcode = '22023';
  end if;

  select * into v_existing
  from public.orders
  where checkout_idempotency_key = p_checkout_idempotency_key;

  if found then
    return jsonb_build_object(
      'orderId', v_existing.id,
      'orderCode', v_existing.order_code,
      'status', v_existing.status,
      'subtotalCents', v_existing.subtotal_cents,
      'discountCents', v_existing.discount_cents,
      'shippingCents', v_existing.shipping_cents,
      'totalCents', v_existing.total_cents,
      'idempotentReplay', true
    );
  end if;

  select * into strict v_settings from public.store_settings where singleton;
  if v_settings.store_mode = 'paused' then
    raise exception 'store_paused' using errcode = 'P0001';
  end if;

  case p_shipping_method
    when 'pickup' then
      if not v_settings.pickup_enabled then raise exception 'pickup_disabled'; end if;
      if p_address is not null then raise exception 'pickup_must_not_have_address'; end if;
      v_shipping := 0;
      v_order_status := 'awaiting_payment';
      v_expires_at := now() + interval '30 minutes';
    when 'local_delivery' then
      if not v_settings.local_delivery_enabled then raise exception 'local_delivery_disabled'; end if;
      if jsonb_typeof(p_address) <> 'object'
        or lower(p_address->>'city') <> lower(v_settings.local_delivery_city)
        or upper(p_address->>'state') <> upper(v_settings.local_delivery_state) then
        raise exception 'address_outside_local_delivery_area';
      end if;
      v_shipping := v_settings.local_delivery_fee_cents;
      v_order_status := 'awaiting_payment';
      v_expires_at := now() + interval '30 minutes';
    when 'national_quote' then
      if not v_settings.national_quote_enabled then raise exception 'national_quote_disabled'; end if;
      if jsonb_typeof(p_address) <> 'object' then raise exception 'national_quote_requires_address'; end if;
      v_shipping := null;
      v_order_status := 'quote_requested';
      v_expires_at := now() + interval '48 hours';
    else
      raise exception 'invalid_shipping_method';
  end case;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'invalid_items';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_quantity := (v_item->>'quantity')::integer;
    exception when others then
      raise exception 'invalid_item_quantity';
    end;
    if v_quantity not between 1 and 20 then raise exception 'invalid_item_quantity'; end if;
    if not public.is_valid_order_selection(v_item->'selection') then
      raise exception 'invalid_item_selection';
    end if;

    select
      pv.*,
      p.slug as product_slug,
      p.name as product_name,
      p.kind as product_kind,
      p.base_price_cents,
      p.active as product_active,
      p.availability_mode as product_availability
    into v_variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = (v_item->>'variantId')::uuid
    for update of pv;

    if not found or not v_variant.active or not v_variant.product_active
      or v_variant.availability_mode = 'unavailable'
      or v_variant.product_availability = 'unavailable' then
      raise exception 'item_unavailable';
    end if;

    if v_variant.product_kind = 'simple' then
      if v_item->'selection'->>'type' <> 'simple'
        or v_variant.color_id is distinct from v_item->'selection'->>'colorId'
        or v_variant.size_id is distinct from v_item->'selection'->>'size'
        or v_variant.application_id is not null then
        raise exception 'selection_does_not_match_variant';
      end if;
    else
      if v_item->'selection'->>'type' <> 'kit' then raise exception 'kit_selection_required'; end if;
      select * into strict v_kit_rule
      from public.kit_rules where product_id = v_variant.product_id;
      if jsonb_array_length(v_item->'selection'->'pieces') <> v_kit_rule.piece_count then
        raise exception 'invalid_kit_piece_count';
      end if;
      for v_piece in select value from jsonb_array_elements(v_item->'selection'->'pieces')
      loop
        if not (v_piece->>'applicationId' = any(v_kit_rule.allowed_application_ids))
          or not (v_piece->>'colorId' = any(v_kit_rule.allowed_color_ids))
          or not (v_piece->>'size' = any(v_kit_rule.allowed_size_ids)) then
          raise exception 'kit_option_not_allowed';
        end if;
      end loop;
    end if;

    v_unit_price := coalesce(v_variant.price_override_cents, v_variant.base_price_cents);
    v_subtotal := v_subtotal + (v_unit_price::bigint * v_quantity);
    if v_subtotal > 2147483647 then raise exception 'order_total_too_large'; end if;
  end loop;

  if nullif(upper(btrim(p_coupon_code)), '') is not null then
    select * into v_coupon
    from public.coupons
    where code = upper(btrim(p_coupon_code))::extensions.citext
      and active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
    for update;
    if not found then raise exception 'coupon_invalid'; end if;
    if v_coupon.minimum_subtotal_cents is not null and v_subtotal < v_coupon.minimum_subtotal_cents then
      raise exception 'coupon_minimum_not_met';
    end if;

    select count(*) into v_redemptions from public.coupon_redemptions
    where coupon_id = v_coupon.id and status in ('reserved', 'consumed');
    if v_coupon.max_redemptions is not null and v_redemptions >= v_coupon.max_redemptions then
      raise exception 'coupon_limit_reached';
    end if;

    select count(*) into v_customer_redemptions from public.coupon_redemptions
    where coupon_id = v_coupon.id
      and customer_key_hash = p_customer_key_hash
      and status in ('reserved', 'consumed');
    if v_coupon.max_redemptions_per_customer is not null
      and v_customer_redemptions >= v_coupon.max_redemptions_per_customer then
      raise exception 'coupon_customer_limit_reached';
    end if;
    if v_coupon.first_order_only and exists (
      select 1 from public.coupon_redemptions
      where customer_key_hash = p_customer_key_hash and status = 'consumed'
    ) then
      raise exception 'coupon_first_order_only';
    end if;

    if v_coupon.discount_type = 'percentage' then
      v_discount := floor(v_subtotal * v_coupon.value / 100.0);
    else
      v_discount := v_coupon.value;
    end if;
    v_discount := least(v_discount, v_subtotal);
    if v_coupon.maximum_discount_cents is not null then
      v_discount := least(v_discount, v_coupon.maximum_discount_cents);
    end if;
  end if;

  v_total := case when v_shipping is null then null else v_subtotal - v_discount + v_shipping end;

  insert into public.orders (
    order_code, checkout_idempotency_key, public_token_hash, status, shipping_method,
    customer_name, customer_phone, customer_phone_normalized, customer_email,
    customer_email_normalized, privacy_terms_version, privacy_accepted_at, address,
    subtotal_cents, discount_cents, shipping_cents, total_cents, coupon_id,
    coupon_code_snapshot, notes, expires_at
  ) values (
    'ART-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.order_code_seq')::text, 6, '0'),
    p_checkout_idempotency_key, p_public_token_hash, v_order_status, p_shipping_method,
    btrim(p_customer_name), p_customer_phone, p_customer_phone_normalized,
    nullif(lower(btrim(p_customer_email)), ''), nullif(p_customer_email_normalized, ''),
    p_privacy_terms_version, now(), p_address, v_subtotal::integer, v_discount::integer,
    v_shipping, v_total::integer, v_coupon.id, v_coupon.code::text, nullif(btrim(p_notes), ''),
    v_expires_at
  ) returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    select
      pv.*,
      p.slug as product_slug,
      p.name as product_name,
      p.base_price_cents
    into strict v_variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = (v_item->>'variantId')::uuid
    for update of pv;
    v_unit_price := coalesce(v_variant.price_override_cents, v_variant.base_price_cents);

    insert into public.order_items (
      order_id, product_id, variant_id, product_slug_snapshot, product_name_snapshot,
      sku_snapshot, unit_price_cents, quantity, selection, image_snapshot
    ) values (
      v_order.id, v_variant.product_id, v_variant.id, v_variant.product_slug,
      v_variant.product_name, v_variant.sku, v_unit_price, v_quantity,
      v_item->'selection', nullif(v_item->>'imageSnapshot', '')
    );

    if v_variant.availability_mode = 'limited' then
      select coalesce(sum(quantity), 0)::integer into v_reserved
      from public.inventory_reservations
      where variant_id = v_variant.id and status = 'active' and expires_at > now();
      if v_variant.stock_quantity - v_reserved < v_quantity then
        raise exception 'insufficient_stock';
      end if;
      insert into public.inventory_reservations (
        order_id, variant_id, quantity, status, expires_at
      ) values (v_order.id, v_variant.id, v_quantity, 'active', v_expires_at);
    end if;
  end loop;

  if v_coupon.id is not null then
    insert into public.coupon_redemptions (coupon_id, order_id, customer_key_hash)
    values (v_coupon.id, v_order.id, p_customer_key_hash);
  end if;

  insert into public.order_status_history (order_id, from_status, to_status, source, note)
  values (v_order.id, null, v_order.status, 'system', 'Pedido criado');

  return jsonb_build_object(
    'orderId', v_order.id,
    'orderCode', v_order.order_code,
    'status', v_order.status,
    'subtotalCents', v_order.subtotal_cents,
    'discountCents', v_order.discount_cents,
    'shippingCents', v_order.shipping_cents,
    'totalCents', v_order.total_cents,
    'idempotentReplay', false
  );
exception
  when unique_violation then
    select * into v_existing from public.orders
    where checkout_idempotency_key = p_checkout_idempotency_key;
    if found then
      return jsonb_build_object(
        'orderId', v_existing.id,
        'orderCode', v_existing.order_code,
        'status', v_existing.status,
        'subtotalCents', v_existing.subtotal_cents,
        'discountCents', v_existing.discount_cents,
        'shippingCents', v_existing.shipping_cents,
        'totalCents', v_existing.total_cents,
        'idempotentReplay', true
      );
    end if;
    raise;
end;
$$;

create or replace function public.expire_order_resources_v1()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.inventory_reservations
    set status = 'expired', updated_at = now()
    where status = 'active' and expires_at <= now()
    returning order_id
  )
  select count(*) into v_count from expired;

  update public.coupon_redemptions cr
  set status = 'released'
  from public.orders o
  where cr.order_id = o.id
    and cr.status = 'reserved'
    and o.expires_at <= now()
    and o.payment_status <> 'approved';

  return v_count;
end;
$$;

create or replace function public.mark_order_paid_v1(
  p_order_id uuid,
  p_provider_payment_id text,
  p_raw_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_reservation public.inventory_reservations%rowtype;
begin
  select * into strict v_order from public.orders where id = p_order_id for update;
  if v_order.payment_status = 'approved' then return; end if;
  if v_order.total_cents is null then raise exception 'order_requires_shipping_quote'; end if;

  for v_reservation in
    select * from public.inventory_reservations
    where order_id = p_order_id and status = 'active'
    for update
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - v_reservation.quantity
    where id = v_reservation.variant_id
      and availability_mode = 'limited'
      and stock_quantity >= v_reservation.quantity;
    if not found then raise exception 'insufficient_stock_on_payment'; end if;
  end loop;

  update public.inventory_reservations
  set status = 'committed', updated_at = now()
  where order_id = p_order_id and status = 'active';

  update public.coupon_redemptions
  set status = 'consumed', consumed_at = now()
  where order_id = p_order_id and status = 'reserved';

  update public.orders
  set status = 'paid', payment_status = 'approved', paid_at = now(), updated_at = now()
  where id = p_order_id;

  update public.payment_attempts
  set provider_payment_id = coalesce(provider_payment_id, p_provider_payment_id),
      status = 'approved', raw_status = p_raw_status, updated_at = now()
  where order_id = p_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, source, note)
  values (p_order_id, v_order.status, 'paid', 'webhook', 'Pagamento confirmado pelo provedor');
end;
$$;

create or replace function public.release_order_resources_v1(
  p_order_id uuid,
  p_target_status text,
  p_source text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_target_status not in ('cancelled', 'refunded') or p_source not in ('system', 'admin', 'webhook') then
    raise exception 'invalid_release_transition';
  end if;
  select * into strict v_order from public.orders where id = p_order_id for update;

  update public.inventory_reservations
  set status = 'released', updated_at = now()
  where order_id = p_order_id and status = 'active';
  update public.coupon_redemptions
  set status = 'released'
  where order_id = p_order_id and status = 'reserved';
  update public.orders
  set status = p_target_status,
      payment_status = case when p_target_status = 'refunded' then 'refunded' else payment_status end,
      updated_at = now()
  where id = p_order_id;
  insert into public.order_status_history (order_id, from_status, to_status, source, note)
  values (p_order_id, v_order.status, p_target_status, p_source, p_note);
end;
$$;

revoke all on function public.create_order_v1(text, text, text, text, text, text, text, text, text, text, jsonb, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.expire_order_resources_v1() from public, anon, authenticated;
revoke all on function public.mark_order_paid_v1(uuid, text, text) from public, anon, authenticated;
revoke all on function public.release_order_resources_v1(uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.create_order_v1(text, text, text, text, text, text, text, text, text, text, jsonb, text, text, jsonb) to service_role;
grant execute on function public.expire_order_resources_v1() to service_role;
grant execute on function public.mark_order_paid_v1(uuid, text, text) to service_role;
grant execute on function public.release_order_resources_v1(uuid, text, text, text) to service_role;
