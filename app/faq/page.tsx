import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Perguntas frequentes', alternates: { canonical: '/faq' } };
import { GenericContent } from '@/components/page-blocks';
import { FAQ, SearchBar } from '@/components/site';
import { getPublishedFaqs } from '@/lib/faq';

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const items = await getPublishedFaqs();
  return <GenericContent eyebrow="Central de ajuda" title="Perguntas frequentes." description="Encontre respostas sobre consultas, resultados, pagamento e segurança.">
    <SearchBar />
    <div className="faq-category"><span className="eyebrow">Consultas e resultados</span>
      {items.length ? <FAQ items={items} /> : <p className="customer-empty-card">Nenhuma pergunta publicada ainda.</p>}
    </div>
  </GenericContent>;
}
