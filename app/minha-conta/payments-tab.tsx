'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Clock3, LoaderCircle, QrCode, Receipt, RefreshCw } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type Payment = {
  id: string; provider: string; method: string | null; status: string;
  amountCents: number; installments: number | null; attempts: number;
  externalId: string | null; createdAt: string; updatedAt: string;
  order: { id: string; plate: string; status: string; createdAt: string; product: { name: string } };
  events: { externalEventId: string; eventType: string | null; status: string; createdAt: string; processedAt: string | null }[];
};

const statusLabel: Record<string, string> = {
  APPROVED: 'Pago', AUTHORIZED: 'Autorizado', IN_PROCESS: 'Processando',
  PENDING: 'Pendente', REJECTED: 'Recusado', CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado', CHARGEBACK: 'Chargeback', EXPIRED: 'Expirado',
};
const methodLabel: Record<string, string> = { card: 'Cartão', pix: 'Pix', bolbradesco: 'Boleto', boleto: 'Boleto', free: 'Gratuito' };
const eventTypeLabel: Record<string, string> = {
  order: 'Notificação de pedido', payment: 'Notificação de pagamento', status_check: 'Consulta de status',
  card_checkout: 'Pagamento com cartão', checkout: 'Checkout', card: 'Cartão',
};
const eventStatusLabel: Record<string, string> = {
  RECEIVED: 'Recebido', PROCESSED: 'Processado', IGNORED: 'Ignorado', FAILED: 'Falhou', ERROR: 'Erro',
};
const eventTypeText = (type: string | null) => type ? (eventTypeLabel[type] || type.replace(/_/g, ' ')) : 'Webhook';
const eventStatusText = (status: string) => eventStatusLabel[status] || status.toLowerCase();
const methodIcon = (method: string | null) => method === 'pix' ? <QrCode size={16} /> : method === 'card' ? <CreditCard size={16} /> : <Receipt size={16} />;

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/account/payments', { cache: 'no-store' });
      const body = await readJson(response);
      if (!response.ok) throw new Error(body.error || 'Não foi possível carregar o histórico.');
      setPayments(body.data || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return <section className="customer-tab-content">
    <span className="customer-eyebrow">FINANCEIRO</span>
    <h1>Histórico de pagamentos</h1>
    <p>Acompanhe todas as tentativas de pagamento da sua conta, com status, pedido e data.</p>
    <div style={{ margin: '16px 0' }}><button className="customer-secondary-button" onClick={() => void load()} disabled={loading}>{loading ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />} Atualizar</button></div>
    {error && <p className="customer-inline-error">{error}</p>}
    {loading ? <div className="customer-empty-card"><Clock3 size={22} /> Carregando histórico…</div>
      : payments.length === 0 ? <div className="customer-empty-card"><CreditCard size={24} /><div><h3>Nenhum pagamento ainda</h3><p>Quando você fizer uma consulta, as tentativas de pagamento aparecerão aqui.</p></div></div>
      : <div className="customer-query-list">
        {payments.map(p => <article className="customer-query-card" key={p.id}>
          <div className="customer-query-card-head">
            <div>
              <span className="customer-eyebrow">{methodIcon(p.method)} {methodLabel[p.method || ''] || 'Pagamento'} · {p.provider}</span>
              <h3>{p.order.product.name} — {p.order.plate}</h3>
              <small>Pedido {p.order.id.slice(-8).toUpperCase()} · {(p.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{p.installments && p.installments > 1 ? ` · ${p.installments}x` : ''}</small>
            </div>
            <span className={`customer-query-status ${p.status === 'APPROVED' ? 'completed' : p.status.toLowerCase()}`}>{statusLabel[p.status] || p.status}</span>
          </div>
          <p>Criado em {new Date(p.createdAt).toLocaleString('pt-BR')} · atualizado em {new Date(p.updatedAt).toLocaleString('pt-BR')}. Tentativas: {p.attempts}.</p>
          {p.externalId && <p><small>ID da transação: {p.externalId}</small></p>}
          {p.events.length > 0 && <div className="customer-query-result"><strong>Eventos do provedor</strong>{p.events.map(ev => <span key={ev.externalEventId}>{eventTypeText(ev.eventType)} — {eventStatusText(ev.status)} · {new Date(ev.createdAt).toLocaleString('pt-BR')}</span>)}</div>}
        </article>)}
      </div>}
  </section>;
}
