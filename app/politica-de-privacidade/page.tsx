import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Política de privacidade', alternates: { canonical: '/politica-de-privacidade' } };
import { getInstitutionalPages } from '@/lib/institutional-pages';
import { LegalPage } from '@/components/legal';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const pages = await getInstitutionalPages();
  return <LegalPage eyebrow="Legal" title={pages.privacidade.title} html={pages.privacidade.content} />;
}
