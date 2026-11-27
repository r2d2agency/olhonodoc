import { getInstitutionalPages } from '@/lib/institutional-pages';
import { LegalPage } from '@/components/legal';

export const dynamic = 'force-dynamic';

export default async function RefundPage() {
  const pages = await getInstitutionalPages();
  return <LegalPage eyebrow="Legal" title={pages.reembolso.title} html={pages.reembolso.content} />;
}
