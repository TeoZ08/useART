import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney } from '@/lib/money';
import styles from '../../admin.module.css';

export default async function AdminProductsPage() {
  const db = createAdminClient();
  const { data, error } = await db
    .from('products')
    .select(
      'id, slug, name, line, base_price_cents, active, availability_mode, review_required, product_variants(count)',
    )
    .order('created_at');
  if (error) throw new Error(`Falha ao carregar produtos: ${error.message}`);
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Catálogo</p>
        <h1>Produtos</h1>
        <p>Edite o catálogo remoto. Produtos com histórico devem ser inativados, não excluídos.</p>
      </header>
      <div className={styles.toolbar}>
        <span>{data.length} produtos oficiais</span>
        <Link className={styles.button} href="/admin/produtos/novo">
          Novo produto
        </Link>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Linha</th>
              <th>Preço</th>
              <th>Variantes</th>
              <th>Disponibilidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link href={`/admin/produtos/${product.id}`}>{product.name}</Link>
                  <br />
                  <small>{product.slug}</small>
                </td>
                <td>{product.line}</td>
                <td>{formatMoney(product.base_price_cents)}</td>
                <td>{product.product_variants[0]?.count ?? 0}</td>
                <td>{product.availability_mode}</td>
                <td>
                  <span className={styles.status}>{product.active ? 'Ativo' : 'Inativo'}</span>
                  {product.review_required ? ' • revisar' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
