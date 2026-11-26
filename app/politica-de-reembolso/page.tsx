import { getInstitutionalPages } from '@/lib/institutional-pages';
import { LegalPage } from '@/components/legal';

export const dynamic = 'force-dynamic';

const fallback = `<h2>1. Solicitação</h2><p>Se você teve algum problema com uma consulta contratada, entre em contato pelo canal de atendimento informando seu e-mail e o número do pedido.</p><h2>2. Análise</h2><p>A solicitação será analisada conforme o motivo apresentado e o status da consulta. Consultas já entregues e com acesso ao relatório liberado podem não ser elegíveis.</p><h2>3. Reembolso</h2><p>Quando aprovado, o reembolso é feito na forma de pagamento original, no prazo informado pela instituição financeira ou operador de pagamento.</p><h2>4. Contato</h2><p>Use a página de contato do site para solicitar a análise do seu pedido.</p>`;

export default async function RefundPage() {
  return <LegalPage eyebrow="Legal" title="Política de reembolso" html={fallback} />;
}
