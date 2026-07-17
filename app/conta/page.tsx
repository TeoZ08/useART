import Link from 'next/link';
import { AccountAuthForm } from '@/components/account/AccountAuthForm';
import { AccountSignOutButton } from '@/components/account/AccountSignOutButton';
import { CustomerOrders } from '@/components/account/CustomerOrders';
import styles from '@/components/account/Account.module.css';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrders } from '@/services/orders/customer-orders';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Conta', robots: { index: false, follow: false } };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let user: { email?: string; email_confirmed_at?: string | null } | null = null;
  try {
    const { data } = await (await createClient()).auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }
  if (!user?.email || !user.email_confirmed_at) {
    const { error } = await searchParams;
    return (
      <section className={styles.shell}>
        <AccountAuthForm
          initialError={
            error === 'invalid_link' ? 'O link de acesso expirou ou já foi utilizado.' : ''
          }
        />
      </section>
    );
  }

  const orders = await getCustomerOrders(user.email);
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Conta ART</p>
      <h1 className={styles.title}>Seus pedidos.</h1>
      <p className={styles.lead}>
        Pedidos realizados com este e-mail aparecem aqui. Você também pode continuar usando o link
        de acompanhamento enviado no checkout.
      </p>
      <div className={styles.toolbar}>
        <Link className={styles.secondaryButton} href="/conta/pedidos">
          Ver todos os pedidos
        </Link>
        <AccountSignOutButton />
      </div>
      <CustomerOrders orders={orders} />
    </section>
  );
}
