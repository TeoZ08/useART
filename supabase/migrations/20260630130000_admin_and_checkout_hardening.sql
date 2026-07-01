alter table public.products
  add column if not exists confirmed_facts text[] not null default '{}',
  add column if not exists pending_facts text[] not null default '{}';

alter table public.orders
  add column if not exists tracking_code text,
  add column if not exists tracking_url text,
  add column if not exists quoted_at timestamptz;

create table if not exists public.request_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (scope, key_hash, window_started_at)
);

alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit_v1(
  p_scope text,
  p_key_hash text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if nullif(p_scope, '') is null or nullif(p_key_hash, '') is null
    or p_max_requests < 1 or p_window_seconds < 1 then
    raise exception 'invalid_rate_limit_configuration';
  end if;
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  insert into public.request_rate_limits (scope, key_hash, window_started_at, request_count)
  values (p_scope, p_key_hash, v_window, 1)
  on conflict (scope, key_hash, window_started_at)
  do update set request_count = public.request_rate_limits.request_count + 1
  returning request_count into v_count;
  delete from public.request_rate_limits
  where window_started_at < now() - interval '2 days';
  return v_count <= p_max_requests;
end;
$$;

create or replace function public.create_order_v2(
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
  v_first_order_only boolean;
begin
  if nullif(upper(btrim(p_coupon_code)), '') is not null then
    select first_order_only into v_first_order_only
    from public.coupons
    where code = upper(btrim(p_coupon_code))::extensions.citext;
    if coalesce(v_first_order_only, false) and exists (
      select 1 from public.orders
      where customer_phone_normalized = p_customer_phone_normalized
        and payment_status = 'approved'
    ) then
      raise exception 'coupon_first_order_only';
    end if;
  end if;
  return public.create_order_v1(
    p_checkout_idempotency_key,
    p_public_token_hash,
    p_customer_key_hash,
    p_customer_name,
    p_customer_phone,
    p_customer_phone_normalized,
    p_customer_email,
    p_customer_email_normalized,
    p_privacy_terms_version,
    p_shipping_method,
    p_address,
    p_coupon_code,
    p_notes,
    p_items
  );
end;
$$;

create or replace function public.admin_quote_order_v1(
  p_order_id uuid,
  p_shipping_cents integer,
  p_actor_user_id uuid,
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
  if p_shipping_cents < 0 then raise exception 'invalid_shipping_amount'; end if;
  select * into strict v_order from public.orders where id = p_order_id for update;
  if v_order.status <> 'quote_requested' or v_order.shipping_method <> 'national_quote' then
    raise exception 'order_not_waiting_for_quote';
  end if;
  update public.orders set
    shipping_cents = p_shipping_cents,
    total_cents = subtotal_cents - discount_cents + p_shipping_cents,
    status = 'awaiting_payment',
    quoted_at = now(),
    expires_at = now() + interval '30 minutes',
    updated_at = now()
  where id = p_order_id;
  update public.inventory_reservations set expires_at = now() + interval '30 minutes', updated_at = now()
  where order_id = p_order_id and status = 'active';
  insert into public.order_status_history (order_id, from_status, to_status, actor_user_id, source, note)
  values (p_order_id, v_order.status, 'awaiting_payment', p_actor_user_id, 'admin', p_note);
end;
$$;

create or replace function public.admin_transition_order_v1(
  p_order_id uuid,
  p_target_status text,
  p_actor_user_id uuid,
  p_note text default null,
  p_tracking_code text default null,
  p_tracking_url text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_allowed boolean := false;
begin
  select * into strict v_order from public.orders where id = p_order_id for update;
  v_allowed := (v_order.status = 'paid' and p_target_status = 'in_production')
    or (v_order.status = 'in_production' and p_target_status = 'ready_for_pickup')
    or (v_order.status = 'ready_for_pickup' and p_target_status in ('shipped', 'delivered'))
    or (v_order.status = 'shipped' and p_target_status = 'delivered');
  if not v_allowed then raise exception 'invalid_order_transition'; end if;
  if p_target_status = 'shipped' and nullif(btrim(p_tracking_code), '') is null then
    raise exception 'tracking_required';
  end if;
  update public.orders set
    status = p_target_status,
    tracking_code = case when p_target_status = 'shipped' then btrim(p_tracking_code) else tracking_code end,
    tracking_url = case when p_target_status = 'shipped' then nullif(btrim(p_tracking_url), '') else tracking_url end,
    updated_at = now()
  where id = p_order_id;
  insert into public.order_status_history (order_id, from_status, to_status, actor_user_id, source, note)
  values (p_order_id, v_order.status, p_target_status, p_actor_user_id, 'admin', p_note);
end;
$$;

create or replace function public.set_primary_product_image_v1(p_product_id uuid, p_image_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.product_images where id = p_image_id and product_id = p_product_id
  ) then raise exception 'image_not_found'; end if;
  update public.product_images set is_primary = false, updated_at = now()
  where product_id = p_product_id and is_primary;
  update public.product_images set is_primary = true, updated_at = now()
  where id = p_image_id and product_id = p_product_id;
end;
$$;

revoke all on function public.consume_rate_limit_v1(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_order_v2(text, text, text, text, text, text, text, text, text, text, jsonb, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_quote_order_v1(uuid, integer, uuid, text) from public, anon, authenticated;
revoke all on function public.admin_transition_order_v1(uuid, text, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.set_primary_product_image_v1(uuid, uuid) from public, anon, authenticated;
grant execute on function public.consume_rate_limit_v1(text, text, integer, integer) to service_role;
grant execute on function public.create_order_v2(text, text, text, text, text, text, text, text, text, text, jsonb, text, text, jsonb) to service_role;
grant execute on function public.admin_quote_order_v1(uuid, integer, uuid, text) to service_role;
grant execute on function public.admin_transition_order_v1(uuid, text, uuid, text, text, text) to service_role;
grant execute on function public.set_primary_product_image_v1(uuid, uuid) to service_role;

update public.products set
  confirmed_facts = case slug
    when 'moletom-art' then array['Tecido três cabos.', 'Preço confirmado: R$ 109,90.']
    when 'camiseta-hibrida-logo-lateral' then array['Proteção UV 30.', 'Preço confirmado: R$ 45,00.']
    when 'camiseta-hibrida-logo-central' then array['Proteção UV 30.', 'Preço confirmado: R$ 45,00.']
    when 'camiseta-hibrida-assinatura-lateral' then array['Proteção UV 30.', 'Preço confirmado: R$ 45,00.']
    when 'kit-selecao-3-camisetas' then array['Três camisetas no kit.', 'Preço confirmado: R$ 114,90.']
    when 'camiseta-solid-masculina-logo-central' then array['Preço confirmado: R$ 50,00.']
    when 'camiseta-solid-masculina-assinatura-lateral' then array['Preço confirmado: R$ 50,00.']
    else confirmed_facts end,
  pending_facts = case slug
    when 'moletom-art' then array['Imagem oficial.', 'Peso.', 'Cores confirmadas.', 'Composição detalhada.']
    when 'kit-selecao-3-camisetas' then array['Imagem do kit.', 'Composição final de cada camiseta.', 'Regras de disponibilidade.']
    else array['Composição e cuidados oficiais.', 'Guia de medidas revisado.'] end;
