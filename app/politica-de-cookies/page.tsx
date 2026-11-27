import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Política de cookies', alternates: { canonical: '/politica-de-cookies' } };
import { getInstitutionalPages } from '@/lib/institutional-pages';
import { LegalPage } from '@/components/legal';

export const dynamic = 'force-dynamic';

export default async function CookiesPage() {
  const pages = await getInstitutionalPages();
  return <LegalPage eyebrow="Legal" title={pages.cookies.title} html={pages.cookies.content} />;
}
