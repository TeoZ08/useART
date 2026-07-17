'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { writeAdminAudit } from '@/lib/observability/admin-audit';
import { createAdminClient } from '@/lib/supabase/admin';

const nullableText = z.preprocess((value) => (value === '' ? null : value), z.string().nullable());
const nullableInteger = z.preprocess(
  (value) => (value === '' || value == null ? null : Number(value)),
  z.number().int().min(0).nullable(),
);
const productSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  line: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(120),
  kind: z.enum(['simple', 'kit']),
  description: z.string().trim().min(10).max(4000),
  basePriceCents: z.coerce.number().int().min(0),
  availabilityMode: z.enum(['on_demand', 'limited', 'unavailable']),
  leadTimeDays: nullableInteger,
  seoTitle: z.string().trim().min(2).max(180),
  seoDescription: z.string().trim().min(10).max(320),
  confirmedFacts: z.string().max(4000),
  pendingFacts: z.string().max(4000),
});

function checked(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function lines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function saveProduct(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const input = productSchema.parse(Object.fromEntries(formData));
  const db = createAdminClient();
  const values = {
    name: input.name,
    slug: input.slug,
    line: input.line,
    category: input.category,
    kind: input.kind,
    description: input.description,
    base_price_cents: input.basePriceCents,
    active: checked(formData, 'active'),
    featured: checked(formData, 'featured'),
    availability_mode: input.availabilityMode,
    lead_time_days: input.leadTimeDays,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    review_required: checked(formData, 'reviewRequired'),
    confirmed_facts: lines(input.confirmedFacts),
    pending_facts: lines(input.pendingFacts),
  };
  const query = input.id
    ? db.from('products').update(values).eq('id', input.id).select('id').single()
    : db.from('products').insert(values).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao salvar produto: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: input.id ? 'product.update' : 'product.create',
    entityType: 'product',
    entityId: data.id,
    metadata: { slug: input.slug },
  });
  revalidatePath('/');
  revalidatePath('/admin/produtos');
  revalidatePath(`/produto/${input.slug}`);
  if (!input.id) redirect(`/admin/produtos/${data.id}`);
}

const variantSchema = z.object({
  id: z.uuid().optional(),
  productId: z.uuid(),
  sku: z.string().trim().min(1).max(120),
  colorId: nullableText,
  sizeId: nullableText,
  applicationId: nullableText,
  priceOverrideCents: nullableInteger,
  availabilityMode: z.enum(['on_demand', 'limited', 'unavailable']),
  stockQuantity: nullableInteger,
});

export async function saveVariant(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const input = variantSchema.parse(Object.fromEntries(formData));
  const db = createAdminClient();
  const values = {
    product_id: input.productId,
    sku: input.sku,
    color_id: input.colorId,
    size_id: input.sizeId,
    application_id: input.applicationId,
    price_override_cents: input.priceOverrideCents,
    active: checked(formData, 'active'),
    availability_mode: input.availabilityMode,
    stock_quantity: input.stockQuantity,
  };
  const query = input.id
    ? db.from('product_variants').update(values).eq('id', input.id).select('id').single()
    : db.from('product_variants').insert(values).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao salvar variante: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: input.id ? 'variant.update' : 'variant.create',
    entityType: 'product_variant',
    entityId: data.id,
    metadata: { product_id: input.productId, sku: input.sku },
  });
  revalidatePath(`/admin/produtos/${input.productId}`);
  revalidatePath('/');
}

export async function saveKitRules(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const productId = z.uuid().parse(formData.get('productId'));
  const pieceCount = z.coerce.number().int().min(1).max(10).parse(formData.get('pieceCount'));
  const applicationIds = z.array(z.string().min(1)).min(1).parse(formData.getAll('applicationIds'));
  const colorIds = z.array(z.string().min(1)).min(1).parse(formData.getAll('colorIds'));
  const sizeIds = z.array(z.string().min(1)).min(1).parse(formData.getAll('sizeIds'));
  const db = createAdminClient();
  const { error } = await db.from('kit_rules').upsert({
    product_id: productId,
    piece_count: pieceCount,
    allowed_application_ids: applicationIds,
    allowed_color_ids: colorIds,
    allowed_size_ids: sizeIds,
  });
  if (error) throw new Error(`Falha ao salvar regras do kit: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'kit_rules.update',
    entityType: 'product',
    entityId: productId,
    metadata: { piece_count: pieceCount },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath('/');
}

const allowedImageTypes = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

export async function uploadProductImage(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const productId = z.uuid().parse(formData.get('productId'));
  const alt = z.string().trim().min(3).max(240).parse(formData.get('alt'));
  const colorId = nullableText.parse(formData.get('colorId'));
  const applicationId = nullableText.parse(formData.get('applicationId'));
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) throw new Error('Selecione uma imagem.');
  const extension = allowedImageTypes.get(file.type);
  if (!extension) throw new Error('Formato não permitido. Use PNG, JPEG, WebP ou AVIF.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Imagem excede 10 MiB.');
  const path = `${productId}/${randomUUID()}.${extension}`;
  const db = createAdminClient();
  const { error: uploadError } = await db.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);
  const { count } = await db
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId);
  const { data, error } = await db
    .from('product_images')
    .insert({
      product_id: productId,
      color_id: colorId,
      application_id: applicationId,
      storage_path: path,
      alt,
      status: 'available',
      cutout_status: 'needs_review',
      is_primary: (count ?? 0) === 0,
      sort_order: Number(formData.get('sortOrder') ?? 0),
    })
    .select('id')
    .single();
  if (error) {
    await db.storage.from('product-images').remove([path]);
    throw new Error(`Falha ao registrar imagem: ${error.message}`);
  }
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'image.upload',
    entityType: 'product_image',
    entityId: data.id,
    metadata: { product_id: productId, mime: file.type, bytes: file.size },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath('/');
}

export async function setPrimaryImage(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const productId = z.uuid().parse(formData.get('productId'));
  const imageId = z.uuid().parse(formData.get('imageId'));
  const db = createAdminClient();
  const { error } = await db.rpc('set_primary_product_image_v1', {
    p_product_id: productId,
    p_image_id: imageId,
  });
  if (error) throw new Error(`Falha ao definir imagem principal: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'image.set_primary',
    entityType: 'product_image',
    entityId: imageId,
    metadata: { product_id: productId },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath('/');
}

export async function updateImage(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const productId = z.uuid().parse(formData.get('productId'));
  const imageId = z.uuid().parse(formData.get('imageId'));
  const alt = z.string().trim().min(3).max(240).parse(formData.get('alt'));
  const sortOrder = z.coerce.number().int().min(0).max(10000).parse(formData.get('sortOrder'));
  const db = createAdminClient();
  const { error } = await db
    .from('product_images')
    .update({
      alt,
      sort_order: sortOrder,
      color_id: nullableText.parse(formData.get('colorId')),
      application_id: nullableText.parse(formData.get('applicationId')),
      status: z.enum(['available', 'partial', 'pending']).parse(formData.get('status')),
    })
    .eq('id', imageId)
    .eq('product_id', productId);
  if (error) throw new Error(`Falha ao atualizar imagem: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'image.update',
    entityType: 'product_image',
    entityId: imageId,
    metadata: { product_id: productId },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath('/');
}

export async function removeProductImage(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const productId = z.uuid().parse(formData.get('productId'));
  const imageId = z.uuid().parse(formData.get('imageId'));
  const db = createAdminClient();
  const { data: image, error: readError } = await db
    .from('product_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single();
  if (readError) throw new Error('Imagem não encontrada.');
  if (image.storage_path) {
    const { error } = await db.storage.from('product-images').remove([image.storage_path]);
    if (error) throw new Error(`Falha ao remover arquivo: ${error.message}`);
  }
  const { error } = await db
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', productId);
  if (error) throw new Error(`Falha ao remover imagem: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'image.delete',
    entityType: 'product_image',
    entityId: imageId,
    metadata: { product_id: productId },
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath('/');
}
