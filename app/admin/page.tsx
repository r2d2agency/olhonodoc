import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSuperadmin } from '@/lib/auth';
import AdminPanel from '@/components/admin-panel';

export default async function AdminPage() {
  const user = await requireSuperadmin();
  if (!user) redirect('/login?next=/admin');
  return <><section className="admin-header"><div><span className="eyebrow">Área administrativa</span><h1>Olá, {user.name || 'administrador'}.</h1><p>Gerencie a operação do Olho no Doc em um só lugar.</p></div><Link href="/" className="button button-outline">Ver site público</Link></section><AdminPanel currentEmail={user.email}/></>;
}