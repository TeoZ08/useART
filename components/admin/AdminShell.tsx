import Link from 'next/link';
import type { AdminContext } from '@/lib/auth/admin';
import { signOutAdmin } from '@/app/admin/(protected)/actions';
import styles from '@/app/admin/admin.module.css';

const navigation = [
  ['/admin', 'Resumo', ['owner', 'admin', 'operator']],
  ['/admin/produtos', 'Produtos', ['owner', 'admin']],
  ['/admin/pedidos', 'Pedidos', ['owner', 'admin', 'operator']],
  ['/admin/cupons', 'Cupons', ['owner', 'admin']],
  ['/admin/configuracoes', 'Configurações', ['owner', 'admin']],
  ['/admin/auditoria', 'Auditoria', ['owner', 'admin']],
] as const;

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminContext;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin">
          ART<span>Commerce</span>
        </Link>
        <nav>
          {navigation
            .filter(([, , roles]) => (roles as readonly string[]).includes(admin.role))
            .map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
        </nav>
        <div className={styles.account}>
          <strong>{admin.displayName}</strong>
          <span>{admin.role}</span>
          <form action={signOutAdmin}>
            <button type="submit">Sair</button>
          </form>
        </div>
      </aside>
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
