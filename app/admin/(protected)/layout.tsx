import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

async function getAdminOrRedirect() {
  try {
    return await requireAdmin();
  } catch {
    redirect('/admin/login');
  }
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminOrRedirect();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
