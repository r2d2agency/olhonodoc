import { getInstitutionalPages } from '@/lib/institutional-pages';
import { LegalPage } from '@/components/legal';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const pages = await getInstitutionalPages();
  return <LegalPage eyebrow="Legal" title={pages.privacidade.title} html={pages.privacidade.content} />;
}
