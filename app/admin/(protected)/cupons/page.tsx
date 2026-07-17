import { CouponForm } from '@/components/admin/CouponForm';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import styles from '../../admin.module.css';

export default async function CouponsPage() {
  await requireAdmin(['owner', 'admin']);
  const db = createAdminClient();
  const { data, error } = await db
    .from('coupons')
    .select('*, coupon_redemptions(count)')
    .order('created_at');
  if (error) throw new Error(`Falha ao carregar cupons: ${error.message}`);
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Promoções</p>
        <h1>Cupons</h1>
        <p>
          Usos só são consumidos após pagamento aprovado. PRIMEIRACOMPRA permanece sujeito à revisão
          comercial.
        </p>
      </header>
      {data.map((coupon) => (
        <section key={coupon.id}>
          <div className={styles.toolbar}>
            <strong>{coupon.code}</strong>
            <span>{coupon.coupon_redemptions[0]?.count ?? 0} registros</span>
          </div>
          <CouponForm coupon={coupon} />
        </section>
      ))}
      <header className={styles.pageHeader}>
        <h2>Novo cupom</h2>
      </header>
      <CouponForm />
    </>
  );
}
