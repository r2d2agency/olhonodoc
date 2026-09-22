import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect('/login?next=/admin');
  return <AdminShell name={user.name || user.email || 'Administrador'}>{children}</AdminShell>;
}
