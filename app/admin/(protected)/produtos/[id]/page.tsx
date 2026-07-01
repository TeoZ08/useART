import { notFound } from 'next/navigation';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth/admin';
import { requirePublicSupabaseEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  removeProductImage,
  saveKitRules,
  saveVariant,
  setPrimaryImage,
  updateImage,
  uploadProductImage,
} from '../actions';
import styles from '../../../admin.module.css';
import type { Tables } from '@/types/database.generated';

export default async function ProductAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(['owner', 'admin']);
  const { id } = await params;
  const db = createAdminClient();
  const [
    productResult,
    variantsResult,
    imagesResult,
    colorsResult,
    sizesResult,
    applicationsResult,
  ] = await Promise.all([
    db.from('products').select('*, kit_rules(*)').eq('id', id).maybeSingle(),
    db.from('product_variants').select('*').eq('product_id', id).order('sku'),
    db.from('product_images').select('*').eq('product_id', id).order('sort_order'),
    db.from('colors').select('*').order('sort_order'),
    db.from('sizes').select('*').order('sort_order'),
    db.from('applications').select('*').order('sort_order'),
  ]);
  if (!productResult.data) notFound();
  const error =
    productResult.error ??
    variantsResult.error ??
    imagesResult.error ??
    colorsResult.error ??
    sizesResult.error ??
    applicationsResult.error;
  if (error) throw new Error(`Falha ao carregar produto: ${error.message}`);
  const product = productResult.data;
  const kitRules = Array.isArray(product.kit_rules) ? product.kit_rules[0] : product.kit_rules;
  const colors = colorsResult.data ?? [];
  const sizes = sizesResult.data ?? [];
  const applications = applicationsResult.data ?? [];
  const publicBase = `${requirePublicSupabaseEnv().url}/storage/v1/object/public/product-images/`;

  const optionFields = (variant?: Tables<'product_variants'>) => (
    <>
      <label>
        <span>SKU</span>
        <input name="sku" defaultValue={variant?.sku ?? ''} required />
      </label>
      <label>
        <span>Cor</span>
        <select name="colorId" defaultValue={variant?.color_id ?? ''}>
          <option value="">Sem cor</option>
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Tamanho</span>
        <select name="sizeId" defaultValue={variant?.size_id ?? ''}>
          <option value="">Sem tamanho</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Aplicação</span>
        <select name="applicationId" defaultValue={variant?.application_id ?? ''}>
          <option value="">Sem aplicação</option>
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Preço override (centavos)</span>
        <input
          name="priceOverrideCents"
          type="number"
          min="0"
          defaultValue={variant?.price_override_cents ?? ''}
        />
      </label>
      <label>
        <span>Disponibilidade</span>
        <select name="availabilityMode" defaultValue={variant?.availability_mode ?? 'on_demand'}>
          <option value="on_demand">Sob encomenda</option>
          <option value="limited">Limitado</option>
          <option value="unavailable">Indisponível</option>
        </select>
      </label>
      <label>
        <span>Estoque (somente limitado)</span>
        <input
          name="stockQuantity"
          type="number"
          min="0"
          defaultValue={variant?.stock_quantity ?? ''}
        />
      </label>
      <label>
        <span>
          <input name="active" type="checkbox" defaultChecked={variant?.active ?? true} /> Ativa
        </span>
      </label>
    </>
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Produto</p>
        <h1>{product.name}</h1>
        <p>{product.slug}</p>
      </header>
      <ProductForm product={product} />

      {product.kind === 'kit' ? (
        <section className={styles.panel}>
          <h2>Regras do Kit</h2>
          <form action={saveKitRules} className={styles.formGrid}>
            <input type="hidden" name="productId" value={product.id} />
            <label>
              <span>Quantidade de peças</span>
              <input
                name="pieceCount"
                type="number"
                min="1"
                max="10"
                defaultValue={kitRules?.piece_count ?? 3}
              />
            </label>
            <fieldset>
              <legend>Aplicações</legend>
              {applications.map((application) => (
                <label key={application.id}>
                  <input
                    type="checkbox"
                    name="applicationIds"
                    value={application.id}
                    defaultChecked={
                      kitRules?.allowed_application_ids.includes(application.id) ?? true
                    }
                  />{' '}
                  {application.name}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Cores</legend>
              {colors.map((color) => (
                <label key={color.id}>
                  <input
                    type="checkbox"
                    name="colorIds"
                    value={color.id}
                    defaultChecked={kitRules?.allowed_color_ids.includes(color.id) ?? true}
                  />{' '}
                  {color.name}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Tamanhos</legend>
              {sizes.map((size) => (
                <label key={size.id}>
                  <input
                    type="checkbox"
                    name="sizeIds"
                    value={size.id}
                    defaultChecked={kitRules?.allowed_size_ids.includes(size.id) ?? true}
                  />{' '}
                  {size.name}
                </label>
              ))}
            </fieldset>
            <div className={styles.full}>
              <button className={styles.button} type="submit">
                Salvar regras do Kit
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2>Variantes e estoque</h2>
        {(variantsResult.data ?? []).map((variant) => (
          <form action={saveVariant} className={styles.formGrid} key={variant.id}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={product.id} />
            {optionFields(variant)}
            <div className={styles.full}>
              <button className={styles.button} type="submit">
                Atualizar {variant.sku}
              </button>
            </div>
          </form>
        ))}
        <h3>Nova variante</h3>
        <form action={saveVariant} className={styles.formGrid}>
          <input type="hidden" name="productId" value={product.id} />
          {optionFields()}
          <div className={styles.full}>
            <button className={styles.button} type="submit">
              Adicionar variante
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Imagens</h2>
        <form action={uploadProductImage} className={styles.formGrid} encType="multipart/form-data">
          <input type="hidden" name="productId" value={product.id} />
          <label className={styles.full}>
            <span>Arquivo PNG, JPEG, WebP ou AVIF — máximo 10 MiB</span>
            <input
              name="file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              required
            />
          </label>
          <label className={styles.full}>
            <span>Texto alternativo</span>
            <input name="alt" required minLength={3} maxLength={240} />
          </label>
          <label>
            <span>Cor</span>
            <select name="colorId">
              <option value="">Geral</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Aplicação</span>
            <select name="applicationId">
              <option value="">Geral</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Ordem</span>
            <input name="sortOrder" type="number" min="0" defaultValue="0" />
          </label>
          <div className={styles.full}>
            <button className={styles.button} type="submit">
              Enviar imagem
            </button>
          </div>
        </form>
        <div className={styles.imageGrid}>
          {(imagesResult.data ?? []).map((image) => {
            const src = image.storage_path
              ? `${publicBase}${image.storage_path.split('/').map(encodeURIComponent).join('/')}`
              : image.static_path;
            return (
              <article className={styles.imageCard} key={image.id}>
                {src ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={image.alt} />
                  </>
                ) : (
                  <div className={styles.imagePlaceholder}>Sem arquivo</div>
                )}
                <form action={updateImage} className={styles.formGrid}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <label className={styles.full}>
                    <span>Alt</span>
                    <input name="alt" defaultValue={image.alt} required />
                  </label>
                  <label>
                    <span>Ordem</span>
                    <input name="sortOrder" type="number" min="0" defaultValue={image.sort_order} />
                  </label>
                  <label>
                    <span>Status</span>
                    <select name="status" defaultValue={image.status}>
                      <option value="available">Disponível</option>
                      <option value="partial">Parcial</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </label>
                  <label>
                    <span>Cor</span>
                    <select name="colorId" defaultValue={image.color_id ?? ''}>
                      <option value="">Geral</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Aplicação</span>
                    <select name="applicationId" defaultValue={image.application_id ?? ''}>
                      <option value="">Geral</option>
                      {applications.map((application) => (
                        <option key={application.id} value={application.id}>
                          {application.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className={styles.full}>
                    <button className={styles.button} type="submit">
                      Atualizar imagem
                    </button>
                  </div>
                </form>
                <div className={styles.imageActions}>
                  {!image.is_primary ? (
                    <form action={setPrimaryImage}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <button type="submit">Definir principal</button>
                    </form>
                  ) : (
                    <span className={styles.status}>Principal</span>
                  )}
                  <form action={removeProductImage}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <ConfirmSubmitButton message="Remover esta imagem do produto e do Storage?">
                      Remover
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
