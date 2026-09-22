import { notFound } from 'next/navigation';
import { AdminPlaceholderPage } from '@/app/admin/admin-pages';
import { adminModules } from '@/app/admin/placeholder-pages';

export default function AdminModulePage({ params }: { params: { slug: string[] } }) {
  const key = params.slug[params.slug.length - 1];
  const module = adminModules[key];
  if (!module) notFound();
  return <AdminPlaceholderPage title={module.title} section={module.section}/>;
}
