import type { Tables } from '@/types/database.generated';
import { saveProduct } from '@/app/admin/(protected)/produtos/actions';
import styles from '@/app/admin/admin.module.css';

export function ProductForm({ product }: { product?: Tables<'products'> }) {
  return (
    <form action={saveProduct} className={`${styles.panel} ${styles.formGrid}`}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label>
        <span>Nome</span>
        <input name="name" defaultValue={product?.name} required />
      </label>
      <label>
        <span>Slug</span>
        <input
          name="slug"
          defaultValue={product?.slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
      </label>
      <label>
        <span>Linha</span>
        <input name="line" defaultValue={product?.line} required />
      </label>
      <label>
        <span>Categoria</span>
        <input name="category" defaultValue={product?.category} required />
      </label>
      <label>
        <span>Tipo</span>
        <select name="kind" defaultValue={product?.kind ?? 'simple'}>
          <option value="simple">Simples</option>
          <option value="kit">Kit</option>
        </select>
      </label>
      <label>
        <span>Preço base (centavos)</span>
        <input
          name="basePriceCents"
          type="number"
          min="0"
          defaultValue={product?.base_price_cents}
          required
        />
      </label>
      <label>
        <span>Disponibilidade</span>
        <select name="availabilityMode" defaultValue={product?.availability_mode ?? 'on_demand'}>
          <option value="on_demand">Sob encomenda</option>
          <option value="limited">Limitado</option>
          <option value="unavailable">Indisponível</option>
        </select>
      </label>
      <label>
        <span>Prazo em dias</span>
        <input
          name="leadTimeDays"
          type="number"
          min="0"
          defaultValue={product?.lead_time_days ?? ''}
        />
      </label>
      <label className={styles.full}>
        <span>Descrição</span>
        <textarea name="description" defaultValue={product?.description} required />
      </label>
      <label>
        <span>SEO título</span>
        <input name="seoTitle" defaultValue={product?.seo_title} required />
      </label>
      <label>
        <span>SEO descrição</span>
        <textarea name="seoDescription" defaultValue={product?.seo_description} required />
      </label>
      <label>
        <span>Fatos confirmados (um por linha)</span>
        <textarea name="confirmedFacts" defaultValue={product?.confirmed_facts.join('\n')} />
      </label>
      <label>
        <span>Pendências (uma por linha)</span>
        <textarea name="pendingFacts" defaultValue={product?.pending_facts.join('\n')} />
      </label>
      <label>
        <span>
          <input type="checkbox" name="active" defaultChecked={product?.active} /> Ativo
        </span>
      </label>
      <label>
        <span>
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Destaque
        </span>
      </label>
      <label>
        <span>
          <input
            type="checkbox"
            name="reviewRequired"
            defaultChecked={product?.review_required ?? true}
          />{' '}
          Revisão necessária
        </span>
      </label>
      <div className={styles.full}>
        <button className={styles.button} type="submit">
          Salvar produto
        </button>
      </div>
    </form>
  );
}
