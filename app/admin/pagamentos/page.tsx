'use client';
import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';

type PaymentEvent = { id: string; externalEventId: string; eventType: string | null; status: string; error: string | null; createdAt: string; processedAt: string | null };
type Payment = {
  id: string;
  orderId: string;
  plate: string;
  orderStatus: string;
  provider: string;
  method: string | null;
  installments: number | null;
  status: string;
  amountCents: number;
  externalId: string | null;
  checkoutUrl: string | null;
  attempts: number;
  lastSyncedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  events: PaymentEvent[];
};
type Total = { status: string; count: number; amountCents: number };

const currency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = (value: string | null) => (value ? new Date(value).toLocaleString('pt-BR') : '—');

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente', IN_PROCESS: 'Em análise', AUTHORIZED: 'Autorizado', APPROVED: 'Aprovado',
  REJECTED: 'Recusado', CANCELLED: 'Cancelado', EXPIRED: 'Expirado', REFUNDED: 'Estornado', CHARGEBACK: 'Débito contestado',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Total[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payments?status=${encodeURIComponent(filter)}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível carregar os pagamentos.');
      setPayments(body.data.payments);
      setTotals(body.data.totals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os pagamentos.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function reconcile() {
    setReconciling(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/payments/reconcile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível reconciliar.');
      setMessage(`Reconciliação concluída: ${body.data.checked} verificados, ${body.data.updated} atualizados, ${body.data.failed} falhas.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível reconciliar os pagamentos.');
    } finally {
      setReconciling(false);
    }
  }

  const approvedTotal = totals.filter(t => t.status === 'APPROVED').reduce((sum, t) => sum + t.amountCents, 0);
  const pendingTotal = totals.filter(t => ['PENDING', 'IN_PROCESS', 'AUTHORIZED'].includes(t.status)).reduce((sum, t) => sum + t.amountCents, 0);
  const refundedTotal = totals.filter(t => ['REFUNDED', 'CHARGEBACK'].includes(t.status)).reduce((sum, t) => sum + t.amountCents, 0);

  return (
    <main className="admin-cms">
      <header className="admin-cms-header">
        <div>
          <span className="admin-cms-kicker">VENDAS / FINANCEIRO</span>
          <h1>Pagamentos</h1>
          <p>Transações, tentativas e eventos de webhook registrados pelo provedor.</p>
        </div>
        <div className="admin-cms-actions">
          <button className="admin-secondary-button" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} /> Atualizar
          </button>
          <button className="admin-cms-primary" onClick={() => void reconcile()} disabled={reconciling}>
            {reconciling ? <LoaderCircle size={14} className="spin" /> : <RefreshCw size={14} />}
            {reconciling ? 'Reconciliando…' : 'Reconciliar pendentes'}
          </button>
        </div>
      </header>

      {error && <div className="admin-cms-message error">{error}</div>}
      {message && <div className="admin-cms-message">{message}</div>}

      <section className="admin-order-summary">
        <span>Aprovado: <strong>{currency(approvedTotal)}</strong></span>
        <span>Em aberto: <strong>{currency(pendingTotal)}</strong></span>
        <span>Estornado/diabado: <strong>{currency(refundedTotal)}</strong></span>
        <span>Transações: <strong>{totals.reduce((sum, t) => sum + t.count, 0)}</strong></span>
      </section>

      <section className="admin-cms-card admin-payment-filters">
        <label>Status do pagamento
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>

      <div className="admin-order-table">
        <table>
          <thead>
            <tr><th>Pedido</th><th>Placa</th><th>Provedor / método</th><th>Valor</th><th>Status</th><th>Eventos</th></tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>
                  <strong>{payment.orderId.slice(-8).toUpperCase()}</strong>
                  <small>{dateTime(payment.createdAt)}</small>
                </td>
                <td>{payment.plate}<small>Pedido: {payment.orderStatus}</small></td>
                <td>
                  {payment.provider}
                  <small>{payment.method || '—'}{payment.installments ? ` · ${payment.installments}x` : ''}</small>
                </td>
                <td><strong>{currency(payment.amountCents)}</strong><small>Tentativas: {payment.attempts}</small></td>
                <td>
                  <span className={`admin-order-status ${payment.status.toLowerCase()}`}>{statusLabels[payment.status] || payment.status}</span>
                  <small>Sincronizado: {dateTime(payment.lastSyncedAt)}</small>
                </td>
                <td>
                  {payment.events.length === 0 && <small>Nenhum evento</small>}
                  {payment.events.map(event => (
                    <small key={event.id}>
                      {event.eventType || event.externalEventId} · {event.status}
                      {event.error ? ` · ${event.error}` : ''}
                    </small>
                  ))}
                </td>
              </tr>
            ))}
            {!payments.length && !loading && <tr><td colSpan={6}>Nenhuma transação encontrada.</td></tr>}
            {loading && <tr><td colSpan={6}>Carregando transações…</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
