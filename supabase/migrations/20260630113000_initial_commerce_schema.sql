create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_valid_order_selection(selection jsonb)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select case selection->>'type'
    when 'simple' then
      jsonb_typeof(selection) = 'object'
      and nullif(selection->>'colorId', '') is not null
      and nullif(selection->>'size', '') is not null
    when 'kit' then
      jsonb_typeof(selection->'pieces') = 'array'
      and jsonb_array_length(selection->'pieces') = 3
      and not exists (
        select 1
        from jsonb_array_elements(selection->'pieces') as piece
        where nullif(piece->>'applicationId', '') is null
          or nullif(piece->>'colorId', '') is null
          or nullif(piece->>'size', '') is null
      )
    else false
  end;
$$;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  role text not null check (role in ('owner', 'admin', 'operator')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  line text not null,
  category text not null,
  kind text not null check (kind in ('simple', 'kit')),
  description text not null,
  base_price_cents integer not null check (base_price_cents >= 0),
  active boolean not null default false,
  featured boolean not null default false,
  availability_mode text not null default 'on_demand'
    check (availability_mode in ('on_demand', 'limited', 'unavailable')),
  lead_time_days integer check (lead_time_days is null or lead_time_days >= 0),
  seo_title text not null,
  seo_description text not null,
  review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.colors (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.sizes (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.applications (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  color_id text references public.colors(id),
  size_id text references public.sizes(id),
  application_id text references public.applications(id),
  price_override_cents integer check (price_override_cents is null or price_override_cents >= 0),
  active boolean not null default true,
  availability_mode text not null default 'on_demand'
    check (availability_mode in ('on_demand', 'limited', 'unavailable')),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint active_variant_requires_sku check (not active or nullif(btrim(sku), '') is not null),
  constraint limited_variant_requires_stock check (
    availability_mode <> 'limited' or stock_quantity is not null
  ),
  unique nulls not distinct (product_id, color_id, size_id, application_id)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id text references public.colors(id),
  application_id text references public.applications(id),
  storage_path text,
  static_path text,
  alt text not null check (char_length(alt) between 1 and 240),
  status text not null check (status in ('available', 'partial', 'pending')),
  cutout_status text not null default 'not_applicable'
    check (cutout_status in ('available', 'needs_review', 'not_applicable')),
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint image_has_single_source check (
    (storage_path is not null)::integer + (static_path is not null)::integer <= 1
  ),
  constraint available_image_has_source check (
    status <> 'available' or storage_path is not null or static_path is not null
  )
);

create unique index if not exists product_images_one_primary_idx
on public.product_images(product_id)
where is_primary;

create unique index if not exists product_images_source_idx
on public.product_images(product_id, color_id, application_id, static_path) nulls not distinct;

create table if not exists public.kit_rules (
  product_id uuid primary key references public.products(id) on delete cascade,
  piece_count integer not null default 3 check (piece_count > 0),
  allowed_application_ids text[] not null default '{}',
  allowed_color_ids text[] not null default '{}',
  allowed_size_ids text[] not null default '{}'
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  value integer not null check (value > 0),
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  minimum_subtotal_cents integer check (minimum_subtotal_cents is null or minimum_subtotal_cents >= 0),
  maximum_discount_cents integer check (maximum_discount_cents is null or maximum_discount_cents >= 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  max_redemptions_per_customer integer
    check (max_redemptions_per_customer is null or max_redemptions_per_customer > 0),
  first_order_only boolean not null default false,
  review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint percentage_coupon_valid check (discount_type <> 'percentage' or value <= 100),
  constraint coupon_window_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.store_settings (
  singleton boolean primary key default true check (singleton),
  store_mode text not null default 'staging' check (store_mode in ('staging', 'live', 'paused')),
  payments_enabled boolean not null default false,
  pickup_enabled boolean not null default true,
  local_delivery_enabled boolean not null default true,
  local_delivery_city text not null default 'Campo Grande',
  local_delivery_state text not null default 'MS',
  local_delivery_fee_cents integer not null default 1000 check (local_delivery_fee_cents >= 0),
  national_quote_enabled boolean not null default true,
  default_lead_time_days integer not null default 10 check (default_lead_time_days >= 0),
  whatsapp_number text not null,
  support_email text,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  checkout_idempotency_key text not null unique,
  public_token_hash text not null unique,
  status text not null default 'draft' check (status in (
    'draft', 'quote_requested', 'awaiting_payment', 'payment_pending', 'paid',
    'in_production', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status text not null default 'not_created' check (payment_status in (
    'not_created', 'pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back'
  )),
  shipping_method text not null check (shipping_method in ('pickup', 'local_delivery', 'national_quote')),
  currency text not null default 'BRL' check (currency = 'BRL'),
  customer_name text not null check (char_length(customer_name) between 2 and 160),
  customer_phone text not null,
  customer_phone_normalized text not null,
  customer_email text,
  customer_email_normalized text,
  privacy_terms_version text not null,
  privacy_accepted_at timestamptz not null,
  address jsonb,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer check (shipping_cents is null or shipping_cents >= 0),
  total_cents integer check (total_cents is null or total_cents >= 0),
  coupon_id uuid references public.coupons(id),
  coupon_code_snapshot text,
  notes text check (notes is null or char_length(notes) <= 2000),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint shipping_address_consistency check (
    (shipping_method = 'pickup' and address is null)
    or (shipping_method in ('local_delivery', 'national_quote') and address is not null)
  ),
  constraint total_consistency check (
    (shipping_cents is null and total_cents is null)
    or total_cents = subtotal_cents - discount_cents + shipping_cents
  ),
  constraint discount_not_above_subtotal check (discount_cents <= subtotal_cents)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_slug_snapshot text not null,
  product_name_snapshot text not null,
  sku_snapshot text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 99),
  selection jsonb not null check (public.is_valid_order_selection(selection)),
  image_snapshot text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  source text not null check (source in ('system', 'admin', 'webhook')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mercadopago' check (provider = 'mercadopago'),
  preference_id text unique,
  provider_payment_id text unique,
  idempotency_key text not null unique,
  status text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  checkout_url text,
  sandbox boolean not null,
  raw_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text,
  request_id text,
  provider_payment_id text,
  event_type text not null,
  signature_valid boolean not null,
  processed boolean not null default false,
  processing_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index if not exists payment_webhook_provider_event_idx
on public.payment_webhook_events(provider, provider_event_id)
where provider_event_id is not null;

create unique index if not exists payment_webhook_request_idx
on public.payment_webhook_events(provider, request_id)
where request_id is not null;

create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'committed', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists inventory_one_active_reservation_idx
on public.inventory_reservations(order_id, variant_id)
where status = 'active';

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_key_hash text not null,
  status text not null default 'reserved' check (status in ('reserved', 'consumed', 'released')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  unique (coupon_id, order_id)
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists orders_phone_idx on public.orders(customer_phone_normalized);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_history_order_idx on public.order_status_history(order_id, created_at);
create index if not exists payment_attempts_order_idx on public.payment_attempts(order_id, created_at desc);
create index if not exists inventory_variant_active_idx
  on public.inventory_reservations(variant_id, expires_at) where status = 'active';
create index if not exists coupon_redemptions_customer_idx
  on public.coupon_redemptions(coupon_id, customer_key_hash, status);
create index if not exists admin_audit_created_idx on public.admin_audit_log(created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admin_profiles', 'products', 'product_variants', 'product_images', 'coupons',
    'store_settings', 'orders', 'payment_attempts', 'inventory_reservations'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;
