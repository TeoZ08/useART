insert into public.colors (id, name, hex, active, sort_order) values
  ('branco-off-white', 'Branco/off-white', '#f4f4f1', true, 10),
  ('preto', 'Preto', '#050505', true, 20),
  ('marrom', 'Marrom', '#5b371a', true, 30),
  ('a-confirmar', 'A confirmar no atendimento', '#8b8b86', true, 99)
on conflict (id) do update set
  name = excluded.name,
  hex = excluded.hex,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.sizes (id, name, sort_order, active) values
  ('PP', 'PP', 10, true),
  ('P', 'P', 20, true),
  ('M', 'M', 30, true),
  ('G', 'G', 40, true),
  ('GG', 'GG', 50, true),
  ('XG', 'XG', 60, true)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.applications (id, name, active, sort_order) values
  ('logo-lateral', 'Logo lateral', true, 10),
  ('logo-central', 'Logo central', true, 20),
  ('assinatura-lateral', 'Assinatura lateral', true, 30)
on conflict (id) do update set
  name = excluded.name,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.store_settings (
  singleton, store_mode, payments_enabled, pickup_enabled, local_delivery_enabled,
  local_delivery_city, local_delivery_state, local_delivery_fee_cents,
  national_quote_enabled, default_lead_time_days, whatsapp_number
) values (
  true, 'staging', false, true, true,
  'Campo Grande', 'MS', 1000, true, 10, '5567991691441'
)
on conflict (singleton) do update set
  store_mode = excluded.store_mode,
  payments_enabled = excluded.payments_enabled,
  pickup_enabled = excluded.pickup_enabled,
  local_delivery_enabled = excluded.local_delivery_enabled,
  local_delivery_city = excluded.local_delivery_city,
  local_delivery_state = excluded.local_delivery_state,
  local_delivery_fee_cents = excluded.local_delivery_fee_cents,
  national_quote_enabled = excluded.national_quote_enabled,
  default_lead_time_days = excluded.default_lead_time_days,
  whatsapp_number = excluded.whatsapp_number,
  updated_at = now();

insert into public.products (
  slug, name, line, category, kind, description, base_price_cents, active, featured,
  availability_mode, lead_time_days, seo_title, seo_description, review_required
) values
  (
    'moletom-art', 'Moletom ART', 'Moletom', 'Moletom', 'simple',
    'Moletom ART em tecido três cabos. Produto mantido como oferta oficial, com imagem e peso ainda pendentes.',
    10990, true, false, 'on_demand', 10,
    'Moletom ART | Conforto em movimento',
    'Moletom ART sob encomenda, com atendimento direto pelo WhatsApp da marca.', true
  ),
  (
    'camiseta-hibrida-logo-lateral', 'Camiseta Híbrida - logo lateral', 'Híbrida', 'Camiseta', 'simple',
    'Camiseta Híbrida com logo lateral da ART. Peça streetwear jovem, esportiva e funcional.',
    4500, true, true, 'on_demand', 10,
    'Camiseta Híbrida logo lateral ART',
    'Camiseta Híbrida com logo lateral, proteção UV 30 e compra assistida.', false
  ),
  (
    'camiseta-hibrida-logo-central', 'Camiseta Híbrida - logo central', 'Híbrida', 'Camiseta', 'simple',
    'Camiseta Híbrida com logo central nas variações branco/off-white, preto e marrom.',
    4500, true, true, 'on_demand', 10,
    'Camiseta Híbrida logo central ART',
    'Camiseta Híbrida com logo central, proteção UV 30 e atendimento via WhatsApp.', false
  ),
  (
    'camiseta-hibrida-assinatura-lateral', 'Camiseta Híbrida - assinatura lateral', 'Híbrida', 'Camiseta', 'simple',
    'Camiseta Híbrida com assinatura lateral nas variações branco/off-white, preto e marrom.',
    4500, true, false, 'on_demand', 10,
    'Camiseta Híbrida assinatura lateral ART',
    'Camiseta Híbrida com assinatura lateral e compra assistida pelo WhatsApp.', false
  ),
  (
    'kit-selecao-3-camisetas', 'Kit Seleção - 3 camisetas', 'Kit Seleção', 'Kit', 'kit',
    'Kit com três camisetas configuradas individualmente por aplicação, cor e tamanho.',
    11490, true, true, 'on_demand', 10,
    'Kit Seleção ART com 3 camisetas',
    'Kit ART com três camisetas e configuração independente por peça.', true
  ),
  (
    'camiseta-solid-masculina-logo-central', 'Camiseta Solid Masculina - logo central', 'Solid Masculina', 'Camiseta', 'simple',
    'Camiseta Solid Masculina com logo central, sob encomenda.',
    5000, true, false, 'on_demand', 10,
    'Camiseta Solid Masculina logo central ART',
    'Camiseta Solid Masculina com logo central e atendimento direto.', true
  ),
  (
    'camiseta-solid-masculina-assinatura-lateral', 'Camiseta Solid Masculina - assinatura lateral', 'Solid Masculina', 'Camiseta', 'simple',
    'Camiseta Solid Masculina com assinatura lateral, sob encomenda.',
    5000, true, false, 'on_demand', 10,
    'Camiseta Solid Masculina assinatura lateral ART',
    'Camiseta Solid Masculina com assinatura lateral e compra assistida.', false
  )
on conflict (slug) do update set
  name = excluded.name,
  line = excluded.line,
  category = excluded.category,
  kind = excluded.kind,
  description = excluded.description,
  base_price_cents = excluded.base_price_cents,
  active = excluded.active,
  featured = excluded.featured,
  availability_mode = excluded.availability_mode,
  lead_time_days = excluded.lead_time_days,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  review_required = excluded.review_required,
  updated_at = now();

with simple_products as (
  select id, slug
  from public.products
  where slug in (
    'camiseta-hibrida-logo-lateral',
    'camiseta-hibrida-logo-central',
    'camiseta-hibrida-assinatura-lateral',
    'camiseta-solid-masculina-logo-central',
    'camiseta-solid-masculina-assinatura-lateral'
  )
), variant_rows as (
  select
    product.id as product_id,
    upper(replace(product.slug, '-', '_')) || '_' || upper(color.id) || '_' || size.id as sku,
    color.id as color_id,
    size.id as size_id
  from simple_products product
  cross join public.colors color
  cross join public.sizes size
  where color.id in ('branco-off-white', 'preto', 'marrom')
)
insert into public.product_variants (
  product_id, sku, color_id, size_id, application_id, active, availability_mode
)
select product_id, sku, color_id, size_id, null, true, 'on_demand'
from variant_rows
on conflict (sku) do update set
  product_id = excluded.product_id,
  color_id = excluded.color_id,
  size_id = excluded.size_id,
  application_id = excluded.application_id,
  active = excluded.active,
  availability_mode = excluded.availability_mode,
  updated_at = now();

with moletom as (
  select id from public.products where slug = 'moletom-art'
)
insert into public.product_variants (
  product_id, sku, color_id, size_id, active, availability_mode
)
select moletom.id, 'MOLETOM_ART_A_CONFIRMAR_' || size.id, 'a-confirmar', size.id, true, 'on_demand'
from moletom cross join public.sizes size
on conflict (sku) do update set
  product_id = excluded.product_id,
  color_id = excluded.color_id,
  size_id = excluded.size_id,
  active = excluded.active,
  availability_mode = excluded.availability_mode,
  updated_at = now();

insert into public.product_variants (product_id, sku, active, availability_mode)
select id, 'KIT_SELECAO_3_CAMISETAS', true, 'on_demand'
from public.products where slug = 'kit-selecao-3-camisetas'
on conflict (sku) do update set
  product_id = excluded.product_id,
  active = excluded.active,
  availability_mode = excluded.availability_mode,
  updated_at = now();

insert into public.kit_rules (
  product_id, piece_count, allowed_application_ids, allowed_color_ids, allowed_size_ids
)
select
  id,
  3,
  array['logo-lateral', 'logo-central', 'assinatura-lateral'],
  array['branco-off-white', 'preto', 'marrom'],
  array['PP', 'P', 'M', 'G', 'GG', 'XG']
from public.products where slug = 'kit-selecao-3-camisetas'
on conflict (product_id) do update set
  piece_count = excluded.piece_count,
  allowed_application_ids = excluded.allowed_application_ids,
  allowed_color_ids = excluded.allowed_color_ids,
  allowed_size_ids = excluded.allowed_size_ids;

with image_rows(slug, color_id, static_path, alt, cutout_status, sort_order) as (
  values
    ('camiseta-hibrida-logo-lateral', 'branco-off-white', '/assets/products/hybrid-logo-lateral/branco.png', 'Camiseta Híbrida ART com logo lateral na cor Branco/off-white', 'needs_review', 10),
    ('camiseta-hibrida-logo-lateral', 'preto', '/assets/products/cutouts/hybrid-logo-lateral-preto.png', 'Camiseta Híbrida ART com logo lateral na cor Preto', 'available', 20),
    ('camiseta-hibrida-logo-lateral', 'marrom', '/assets/products/cutouts/hybrid-logo-lateral-marrom.png', 'Camiseta Híbrida ART com logo lateral na cor Marrom', 'available', 30),
    ('camiseta-hibrida-logo-central', 'branco-off-white', '/assets/products/hybrid-logo-central/branco.png', 'Camiseta Híbrida ART com logo central na cor Branco/off-white', 'needs_review', 10),
    ('camiseta-hibrida-logo-central', 'preto', '/assets/products/cutouts/hybrid-logo-central-preto.png', 'Camiseta Híbrida ART com logo central na cor Preto', 'available', 20),
    ('camiseta-hibrida-logo-central', 'marrom', '/assets/products/cutouts/hybrid-logo-central-marrom.png', 'Camiseta Híbrida ART com logo central na cor Marrom', 'available', 30),
    ('camiseta-hibrida-assinatura-lateral', 'branco-off-white', '/assets/products/hybrid-assinatura/branco.png', 'Camiseta Híbrida ART com assinatura lateral na cor Branco/off-white', 'needs_review', 10),
    ('camiseta-hibrida-assinatura-lateral', 'preto', '/assets/products/cutouts/hybrid-assinatura-preto.png', 'Camiseta Híbrida ART com assinatura lateral na cor Preto', 'available', 20),
    ('camiseta-hibrida-assinatura-lateral', 'marrom', '/assets/products/cutouts/hybrid-assinatura-marrom.png', 'Camiseta Híbrida ART com assinatura lateral na cor Marrom', 'available', 30),
    ('camiseta-solid-masculina-assinatura-lateral', 'branco-off-white', '/assets/products/solid-assinatura/branco.png', 'Camiseta Solid Masculina ART com assinatura lateral na cor Branco/off-white', 'needs_review', 10),
    ('camiseta-solid-masculina-assinatura-lateral', 'preto', '/assets/products/cutouts/solid-assinatura-preto.png', 'Camiseta Solid Masculina ART com assinatura lateral na cor Preto', 'available', 20),
    ('camiseta-solid-masculina-assinatura-lateral', 'marrom', '/assets/products/cutouts/solid-assinatura-marrom.png', 'Camiseta Solid Masculina ART com assinatura lateral na cor Marrom', 'available', 30)
)
insert into public.product_images (
  product_id, color_id, static_path, alt, status, cutout_status, is_primary, sort_order
)
select
  product.id,
  image_rows.color_id,
  image_rows.static_path,
  image_rows.alt,
  'available',
  image_rows.cutout_status,
  image_rows.sort_order = 10,
  image_rows.sort_order
from image_rows join public.products product using (slug)
on conflict (product_id, color_id, application_id, static_path) do update set
  alt = excluded.alt,
  status = excluded.status,
  cutout_status = excluded.cutout_status,
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.coupons (
  code, discount_type, value, active, max_redemptions_per_customer,
  first_order_only, review_required
) values (
  'PRIMEIRACOMPRA', 'percentage', 10, true, 1, true, true
)
on conflict (code) do update set
  discount_type = excluded.discount_type,
  value = excluded.value,
  active = excluded.active,
  max_redemptions_per_customer = excluded.max_redemptions_per_customer,
  first_order_only = excluded.first_order_only,
  review_required = excluded.review_required,
  updated_at = now();
