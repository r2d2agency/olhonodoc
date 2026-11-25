import { GenericContent } from '@/components/page-blocks';

export function LegalPage({ title, eyebrow, html }: { title: string; eyebrow: string; html?: string }) {
  return <GenericContent eyebrow={eyebrow} title={title} description="Informações oficiais sobre o uso da plataforma e o tratamento dos seus dados.">
    {html
      ? <div className="legal-copy" dangerouslySetInnerHTML={{ __html: html }} />
      : <div className="legal-copy"><p>Documento preparado para receber o conteúdo jurídico oficial do Olho no Doc.</p></div>}
  </GenericContent>;
}
