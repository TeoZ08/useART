import { ProductForm } from '@/components/admin/ProductForm';
import styles from '../../../admin.module.css';

export default function NewProductPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Catálogo</p>
        <h1>Novo produto</h1>
      </header>
      <ProductForm />
    </>
  );
}
