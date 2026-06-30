begin;
select plan(22);

select has_extension('citext', 'citext extension is installed');
select has_table('public', 'products', 'products table exists');
select has_table('public', 'product_variants', 'product variants table exists');
select has_table('public', 'orders', 'orders table exists');
select has_table('public', 'order_items', 'order items table exists');
select has_table('public', 'coupons', 'coupons table exists');
select has_table('public', 'coupon_redemptions', 'coupon redemptions table exists');
select has_table('public', 'payment_attempts', 'payment attempts table exists');
select has_table('public', 'payment_webhook_events', 'webhook events table exists');
select has_table('public', 'inventory_reservations', 'inventory reservations table exists');
select has_table('public', 'admin_audit_log', 'admin audit log table exists');

select col_is_pk('public', 'products', 'id', 'products uses id as primary key');
select col_is_pk('public', 'admin_profiles', 'user_id', 'admin profile maps one-to-one to auth user');
select col_is_unique('public', 'products', 'slug', 'product slug is unique');
select col_is_unique('public', 'orders', 'public_token_hash', 'public order token hash is unique');
select col_is_unique('public', 'orders', 'checkout_idempotency_key', 'checkout key is unique');

select ok(
  public.is_valid_order_selection('{"type":"simple","colorId":"preto","size":"M"}'::jsonb),
  'simple selection is valid'
);
select ok(
  public.is_valid_order_selection(
    '{"type":"kit","pieces":[{"applicationId":"logo-lateral","colorId":"preto","size":"M"},{"applicationId":"logo-central","colorId":"marrom","size":"G"},{"applicationId":"assinatura-lateral","colorId":"branco-off-white","size":"P"}]}'::jsonb
  ),
  'three-piece kit selection is valid'
);
select isnt(
  public.is_valid_order_selection('{"type":"kit","pieces":[]}'::jsonb),
  true,
  'empty kit selection is invalid'
);

select results_eq(
  'select count(*)::bigint from public.products',
  array[7::bigint],
  'seed has seven products'
);
select results_eq(
  $$select value from public.coupons where code = 'PRIMEIRACOMPRA'$$,
  array[10],
  'staging coupon has ten percent value'
);
select results_eq(
  'select local_delivery_fee_cents from public.store_settings where singleton',
  array[1000],
  'Campo Grande delivery fee is ten reais'
);

select * from finish();
rollback;
