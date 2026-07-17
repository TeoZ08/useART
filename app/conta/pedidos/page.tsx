import { redirect } from 'next/navigation';
import { CustomerOrders } from '@/components/account/CustomerOrders';
import styles from '@/components/account/Account.module.css';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrders } from '@/services/orders/customer-orders';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meus pedidos', robots: { index: false, follow: false } };

export default async function AccountOrdersPage() {
  const { data } = await (await createClient()).auth.getUser();
  if (!data.user?.email || !data.user.email_confirmed_at) redirect('/conta');
  const orders = await getCustomerOrders(data.user.email);
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Conta ART</p>
      <h1 className={styles.title}>Meus pedidos.</h1>
      <CustomerOrders orders={orders} />
    </section>
  );
}
