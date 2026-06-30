create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.admin_profiles
  where user_id = (select auth.uid())
    and active
  limit 1;
$$;

create or replace function public.is_active_admin(allowed_roles text[] default array['owner', 'admin', 'operator'])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_admin_role() = any(allowed_roles), false);
$$;

revoke all on function public.current_admin_role() from public, anon;
revoke all on function public.is_active_admin(text[]) from public, anon;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_active_admin(text[]) to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.products enable row level security;
alter table public.colors enable row level security;
alter table public.sizes enable row level security;
alter table public.applications enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.kit_rules enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "public reads active products"
on public.products for select
to anon, authenticated
using (active);

create policy "public reads active colors"
on public.colors for select
to anon, authenticated
using (active);

create policy "public reads active sizes"
on public.sizes for select
to anon, authenticated
using (active);

create policy "public reads active applications"
on public.applications for select
to anon, authenticated
using (active);

create policy "public reads active variants"
on public.product_variants for select
to anon, authenticated
using (
  active
  and exists (
    select 1 from public.products
    where products.id = product_variants.product_id and products.active
  )
);

create policy "public reads published images"
on public.product_images for select
to anon, authenticated
using (
  status = 'available'
  and exists (
    select 1 from public.products
    where products.id = product_images.product_id and products.active
  )
);

create policy "public reads active kit rules"
on public.kit_rules for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = kit_rules.product_id and products.active
  )
);

create policy "public reads store settings"
on public.store_settings for select
to anon, authenticated
using (true);

create policy "admins read own profile"
on public.admin_profiles for select
to authenticated
using (user_id = (select auth.uid()) or public.is_active_admin(array['owner', 'admin']));

create policy "owners manage admin profiles"
on public.admin_profiles for all
to authenticated
using (public.is_active_admin(array['owner']))
with check (public.is_active_admin(array['owner']));

create policy "catalog admins manage products"
on public.products for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage colors"
on public.colors for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage sizes"
on public.sizes for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage applications"
on public.applications for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage variants"
on public.product_variants for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage images"
on public.product_images for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage kits"
on public.kit_rules for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins manage coupons"
on public.coupons for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "catalog admins read coupon redemptions"
on public.coupon_redemptions for select
to authenticated
using (public.is_active_admin(array['owner', 'admin']));

create policy "owners and admins manage settings"
on public.store_settings for all
to authenticated
using (public.is_active_admin(array['owner', 'admin']))
with check (public.is_active_admin(array['owner', 'admin']));

create policy "active admins read orders"
on public.orders for select
to authenticated
using (public.is_active_admin());

create policy "active admins update order workflow"
on public.orders for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy "active admins read order items"
on public.order_items for select
to authenticated
using (public.is_active_admin());

create policy "active admins read order history"
on public.order_status_history for select
to authenticated
using (public.is_active_admin());

create policy "active admins append order history"
on public.order_status_history for insert
to authenticated
with check (
  public.is_active_admin()
  and actor_user_id = (select auth.uid())
  and source = 'admin'
);

create policy "active admins read payment attempts"
on public.payment_attempts for select
to authenticated
using (public.is_active_admin());

create policy "owners and admins read webhook events"
on public.payment_webhook_events for select
to authenticated
using (public.is_active_admin(array['owner', 'admin']));

create policy "active admins read inventory reservations"
on public.inventory_reservations for select
to authenticated
using (public.is_active_admin());

create policy "owners and admins read audit log"
on public.admin_audit_log for select
to authenticated
using (public.is_active_admin(array['owner', 'admin']));

create policy "active admins append audit log"
on public.admin_audit_log for insert
to authenticated
with check (public.is_active_admin() and actor_user_id = (select auth.uid()));

revoke all on all tables in schema public from anon, authenticated;

grant select on public.products, public.colors, public.sizes, public.applications,
  public.product_variants, public.product_images, public.kit_rules, public.store_settings
to anon, authenticated;

grant select, insert, update, delete on public.admin_profiles, public.products, public.colors,
  public.sizes, public.applications, public.product_variants, public.product_images,
  public.kit_rules, public.coupons, public.store_settings
to authenticated;

grant select on public.coupon_redemptions, public.orders, public.order_items,
  public.order_status_history, public.payment_attempts, public.payment_webhook_events,
  public.inventory_reservations, public.admin_audit_log
to authenticated;

grant insert on public.order_status_history, public.admin_audit_log to authenticated;
grant update (status, payment_status, notes, updated_at) on public.orders to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads product image objects"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "catalog admins upload product image objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_active_admin(array['owner', 'admin'])
  and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg', 'webp', 'avif')
);

create policy "catalog admins update product image objects"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_active_admin(array['owner', 'admin']))
with check (
  bucket_id = 'product-images'
  and public.is_active_admin(array['owner', 'admin'])
  and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg', 'webp', 'avif')
);

create policy "catalog admins delete product image objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_active_admin(array['owner', 'admin']));
