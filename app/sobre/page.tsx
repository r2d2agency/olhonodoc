import { getInstitutionalPages } from '@/lib/institutional-pages';
import { GenericContent } from '@/components/page-blocks';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const pages = await getInstitutionalPages();
  return <GenericContent eyebrow="Sobre o Olho no Doc" title={pages.sobre.title} description="Informação para ajudar você a comprar melhor.">
    <div className="legal-copy" dangerouslySetInnerHTML={{ __html: pages.sobre.content }} />
  </GenericContent>;
}
