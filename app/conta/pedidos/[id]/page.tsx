import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { CustomerOrders } from '@/components/account/CustomerOrders';
import styles from '@/components/account/Account.module.css';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrder } from '@/services/orders/customer-orders';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pedido da conta', robots: { index: false, follow: false } };

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { data } = await (await createClient()).auth.getUser();
  if (!data.user?.email || !data.user.email_confirmed_at) redirect('/conta');
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const order = await getCustomerOrder(data.user.email, id);
  if (!order) notFound();
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Conta ART</p>
      <h1 className={styles.title}>{order.order_code}</h1>
      <CustomerOrders orders={[order]} />
    </section>
  );
}
