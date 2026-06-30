begin;
set local search_path = public, extensions;
select plan(25);

select results_eq(
  $$select count(*)::bigint from pg_tables where schemaname = 'public' and rowsecurity$$,
  array[19::bigint],
  'all commerce tables have RLS enabled'
);

select results_eq(
  $$select count(*)::bigint from pg_policies where schemaname = 'public' and tablename = 'orders'$$,
  array[2::bigint],
  'orders have explicit admin read and update policies'
);

set local role anon;

select lives_ok(
  $$select count(*) from public.products$$,
  'anonymous can read the public catalog'
);
select lives_ok(
  $$select count(*) from public.product_variants$$,
  'anonymous can read active variants'
);
select lives_ok(
  $$select count(*) from public.product_images$$,
  'anonymous can read published images'
);
select lives_ok(
  $$select count(*) from public.store_settings$$,
  'anonymous can read public store settings'
);
select throws_ok(
  $$select count(*) from public.coupons$$,
  '42501',
  null,
  'anonymous cannot enumerate coupons'
);
select throws_ok(
  $$select count(*) from public.orders$$,
  '42501',
  null,
  'anonymous cannot enumerate orders'
);
select throws_ok(
  $$select count(*) from public.payment_attempts$$,
  '42501',
  null,
  'anonymous cannot read payment attempts'
);
select throws_ok(
  $$insert into public.orders (
      order_code, checkout_idempotency_key, public_token_hash, shipping_method,
      customer_name, customer_phone, customer_phone_normalized,
      privacy_terms_version, privacy_accepted_at, subtotal_cents, shipping_cents, total_cents
    ) values (
      'FORBIDDEN', 'forbidden', 'forbidden', 'pickup', 'Teste', '67000000000',
      '5567000000000', 'test', now(), 100, 0, 100
    )$$,
  '42501',
  null,
  'anonymous cannot insert orders directly'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id) values ('product-images', 'forbidden.png', null)$$,
  '42501',
  null,
  'anonymous cannot upload product images'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);

select results_eq(
  $$select count(*)::bigint from public.orders$$,
  array[0::bigint],
  'non-admin authenticated user cannot read orders'
);
select results_eq(
  $$select count(*)::bigint from public.coupons$$,
  array[0::bigint],
  'non-admin authenticated user cannot enumerate coupons'
);
select results_eq(
  $$with deleted as (delete from public.products returning id) select count(*)::bigint from deleted$$,
  array[0::bigint],
  'non-admin cannot delete any products'
);
select throws_ok(
  $$select public.create_order_v1('a','b','c','d','e','f',null,null,'v1','pickup',null,null,null,'[]'::jsonb)$$,
  '42501',
  null,
  'authenticated client cannot call checkout RPC directly'
);
select throws_ok(
  $$select public.mark_order_paid_v1(gen_random_uuid(), 'payment', 'approved')$$,
  '42501',
  null,
  'authenticated client cannot mark orders paid'
);

reset role;

select results_eq(
  $$select count(*)::bigint from storage.buckets where id = 'product-images' and public$$,
  array[1::bigint],
  'product image bucket exists and serves published media'
);
select results_eq(
  $$select file_size_limit from storage.buckets where id = 'product-images'$$,
  array[10485760::bigint],
  'product image size limit is ten MiB'
);
select results_eq(
  $$select count(*)::bigint from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%product image objects'$$,
  array[4::bigint],
  'storage has one read and three admin write policies'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'create_order_v1' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'checkout RPC is not granted to browser roles'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'create_order_v2' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'hardened checkout RPC is not granted to browser roles'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'consume_rate_limit_v1' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'rate limit RPC is server-only'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'admin_quote_order_v1' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'quote RPC is server-only'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'admin_transition_order_v1' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'order transition RPC is server-only'
);
select results_eq(
  $$select count(*)::bigint from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'set_primary_product_image_v1' and grantee in ('anon', 'authenticated')$$,
  array[0::bigint],
  'image primary RPC is server-only'
);

select * from finish();
rollback;
