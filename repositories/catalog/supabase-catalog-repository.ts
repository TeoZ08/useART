import 'server-only';

import { catalogSeed } from '@/data/catalog.seed';
import { requirePublicSupabaseEnv } from '@/lib/env';
import { createPublicServerClient } from '@/lib/supabase/public-server';
import type { CatalogRepository } from '@/repositories/catalog/catalog-repository';
import type { Tables } from '@/types/database.generated';
import type {
  CatalogProduct,
  CatalogVariant,
  CutoutStatus,
  ProductApplication,
  ProductApplicationId,
  ProductColor,
  ProductColorId,
  ProductImageStatus,
  ProductMedia,
  ProductSize,
} from '@/types/commerce';

type ProductRow = Tables<'products'> & {
  product_variants: Tables<'product_variants'>[];
  product_images: Tables<'product_images'>[];
  kit_rules: Tables<'kit_rules'> | null;
};

type Lookups = {
  colors: Tables<'colors'>[];
  sizes: Tables<'sizes'>[];
  applications: Tables<'applications'>[];
};

const productSelect = `
  *,
  product_variants(*),
  product_images(*),
  kit_rules(*)
`;

function cutoutStatus(value: string): CutoutStatus {
  if (value === 'needs_review') return 'needs-review';
  if (value === 'not_applicable') return 'not-applicable';
  return 'available';
}

function imageUrl(image: Tables<'product_images'>, storageBaseUrl: string): string | undefined {
  if (image.storage_path) {
    const path = image.storage_path.split('/').map(encodeURIComponent).join('/');
    return `${storageBaseUrl}/storage/v1/object/public/product-images/${path}`;
  }
  return image.static_path ?? undefined;
}

function mapImage(image: Tables<'product_images'>, storageBaseUrl: string): ProductMedia {
  return {
    status: image.status as ProductImageStatus,
    alt: image.alt,
    src: imageUrl(image, storageBaseUrl),
    cutoutStatus: cutoutStatus(image.cutout_status),
    colorId: image.color_id as ProductColorId | undefined,
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function mapProduct(row: ProductRow, lookups: Lookups, storageBaseUrl: string): CatalogProduct {
  const editorial = catalogSeed.find((product) => product.slug === row.slug);
  if (!editorial) throw new Error(`Produto remoto não pertence ao catálogo oficial: ${row.slug}`);

  const variants: CatalogVariant[] = row.product_variants
    .filter((variant) => variant.active)
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku ?? '',
      colorId: variant.color_id as ProductColorId | undefined,
      size: variant.size_id as ProductSize | undefined,
      applicationId: variant.application_id as ProductApplicationId | undefined,
      priceCents: variant.price_override_cents ?? row.base_price_cents,
      availabilityMode: variant.availability_mode as CatalogVariant['availabilityMode'],
      stockQuantity: variant.stock_quantity ?? undefined,
    }));

  const allowedColorIds =
    row.kind === 'kit'
      ? (row.kit_rules?.allowed_color_ids ?? [])
      : unique(variants.map((variant) => variant.colorId).filter(Boolean) as ProductColorId[]);
  const allowedSizeIds =
    row.kind === 'kit'
      ? (row.kit_rules?.allowed_size_ids ?? [])
      : unique(variants.map((variant) => variant.size).filter(Boolean) as ProductSize[]);
  const allowedApplicationIds = row.kit_rules?.allowed_application_ids ?? [];
  const images = row.product_images
    .filter((image) => image.status !== 'pending')
    .sort((left, right) => left.sort_order - right.sort_order);
  const mappedImages = images.map((image) => mapImage(image, storageBaseUrl));

  const colors: ProductColor[] = lookups.colors
    .filter((color) => allowedColorIds.includes(color.id))
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((color) => ({
      id: color.id as ProductColorId,
      name: color.name,
      hex: color.hex,
      media: mappedImages.find((media) => media.colorId === color.id),
    }));
  const sizes = lookups.sizes
    .filter((size) => allowedSizeIds.includes(size.id))
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((size) => size.id as ProductSize);
  const applications: ProductApplication[] = lookups.applications
    .filter((application) => allowedApplicationIds.includes(application.id))
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((application) => ({
      id: application.id as ProductApplicationId,
      name: application.name,
    }));
  const primaryRow = images.find((image) => image.is_primary);
  const primary = primaryRow ? mapImage(primaryRow, storageBaseUrl) : mappedImages[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    line: row.line,
    category: row.category,
    kind: row.kind as CatalogProduct['kind'],
    priceCents: row.base_price_cents,
    description: row.description,
    colors: colors.length ? colors : editorial.colors,
    sizes: sizes.length ? sizes : editorial.sizes,
    media: primary ?? editorial.media,
    gallery: mappedImages.length ? mappedImages : editorial.gallery,
    applications: applications.length ? applications : editorial.applications,
    confirmedFacts: row.confirmed_facts?.length ? row.confirmed_facts : editorial.confirmedFacts,
    pendingFacts: row.pending_facts?.length ? row.pending_facts : editorial.pendingFacts,
    operation: {
      mode: row.availability_mode === 'unavailable' ? 'sob-consulta' : 'sob-encomenda',
      label:
        row.availability_mode === 'unavailable'
          ? 'Indisponível no momento'
          : 'Operação predominantemente sob encomenda',
      leadTime:
        row.lead_time_days == null
          ? undefined
          : `Prazo provisório: até ${row.lead_time_days} dias úteis.`,
    },
    seo: { title: row.seo_title, description: row.seo_description },
    variants,
    commerceAvailable: variants.length > 0 && row.availability_mode !== 'unavailable',
  };
}

export class SupabaseCatalogRepository implements CatalogRepository {
  private async lookups(): Promise<Lookups> {
    const supabase = createPublicServerClient();
    const [colors, sizes, applications] = await Promise.all([
      supabase.from('colors').select('*').eq('active', true),
      supabase.from('sizes').select('*').eq('active', true),
      supabase.from('applications').select('*').eq('active', true),
    ]);
    const error = colors.error ?? sizes.error ?? applications.error;
    if (error) throw new Error(`Falha nos dados auxiliares do catálogo: ${error.message}`);
    return {
      colors: colors.data ?? [],
      sizes: sizes.data ?? [],
      applications: applications.data ?? [],
    };
  }

  async listActive() {
    const supabase = createPublicServerClient();
    const [products, lookups] = await Promise.all([
      supabase
        .from('products')
        .select(productSelect)
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: true }),
      this.lookups(),
    ]);
    if (products.error) throw new Error(`Falha ao carregar catálogo: ${products.error.message}`);
    const storageBaseUrl = requirePublicSupabaseEnv().url;
    return (products.data as unknown as ProductRow[]).map((row) =>
      mapProduct(row, lookups, storageBaseUrl),
    );
  }

  async findActiveBySlug(slug: string) {
    const supabase = createPublicServerClient();
    const [product, lookups] = await Promise.all([
      supabase
        .from('products')
        .select(productSelect)
        .eq('active', true)
        .eq('slug', slug)
        .maybeSingle(),
      this.lookups(),
    ]);
    if (product.error) throw new Error(`Falha ao carregar produto: ${product.error.message}`);
    return product.data
      ? mapProduct(product.data as unknown as ProductRow, lookups, requirePublicSupabaseEnv().url)
      : null;
  }
}
