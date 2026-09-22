import { notFound } from 'next/navigation';
import { AdminPlaceholderPage } from '@/app/admin/admin-pages';
import { adminModules } from '@/app/admin/placeholder-pages';
import CouponsPage from '@/app/admin/cupons/page';
import AdminHomePage from '@/app/admin/site/home/page';

export default function AdminModulePage({ params }: { params: { slug: string[] } }) {
  const key = params.slug[params.slug.length - 1];
  if (key === 'cupons') return <CouponsPage />;
  if (key === 'home') return <AdminHomePage />;
  const module = adminModules[key];
  if (!module) notFound();
  return <AdminPlaceholderPage title={module.title} section={module.section}/>;
}
