'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDownToLine, ArrowRight, Check, Clock3, FileText, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react';
import type { AccountQuery } from './portal';

function statusLabel(item: AccountQuery) {
  const status = item.query?.companyStatus || item.status;
  const map: Record<string, string> = {
    PENDING: 'Pagamento pendente',
    PAID: 'Pagamento confirmado',
    PROCESSING: 'Consulta em andamento',
    COMPLETED: 'Relatório pronto',
    FAILED: 'Falhou — tente de novo',
    CANCELLED: 'Cancelado',
    EXPIRED: 'Expirado',
  };
  return map[status] || status;
}

function statusHint(item: AccountQuery) {
  if (item.query?.providerMessage) return item.query.providerMessage;
  if (item.query?.companyStatus === 'COMPLETED') return 'Resultado recebido pela plataforma.';
  if (item.query?.requestSentAt) return 'Consulta enviada e aguardando atualização.';
  if (item.status === 'PENDING') return 'Pedido criado, mas o pagamento ainda não foi concluído. Continue de onde parou ou exclua para recomeçar.';
  return 'Aguardando envio da consulta.';
}

export default function QueriesTab({ queries, loading, onReload, onNewQuery }: { queries: AccountQuery[]; loading: boolean; onReload: () => void; onNewQuery: () => void }) {
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  // Pedidos pendentes primeiro: são os que precisam de ação.
  const sorted = [...queries].sort((a, b) => {
    const rank = (s: string) => (s === 'PENDING' ? 0 : 1);
    if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const pendingCount = queries.filter((q) => q.status === 'PENDING').length;

  async function removeOrder(id: string) {
    if (!window.confirm('Excluir este pedido pendente? Você poderá criar outro em seguida.')) return;
    setDeletingId(id); setError('');
    try {
      const response = await fetch(`/api/account/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Não foi possível excluir o pedido.');
      onReload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível excluir o pedido.'); }
    finally { setDeletingId(''); }
  }

  return (
    <section className="customer-tab-content">
      <span className="customer-eyebrow">ACOMPANHAMENTO</span>
      <h1>Minhas consultas</h1>
      <p>
        {pendingCount > 0
          ? `Você tem ${pendingCount} pedido(s) aguardando pagamento. Continue de onde parou ou exclua para recomeçar.`
          : 'Acompanhe seus pedidos, continue pagamentos pendentes e baixe seus relatórios.'}
      </p>

      {loading ? (
        <div className="customer-empty-card"><Clock3 size={22} /> Carregando seu histórico…</div>
      ) : sorted.length === 0 ? (
        <div className="customer-empty-card">
          <span className="customer-empty-icon"><FileText size={24} /></span>
          <div><h3>Nenhuma consulta ainda</h3><p>Quando você iniciar uma consulta, ela aparecerá aqui com o status atualizado.</p></div>
          <button onClick={onNewQuery}>Iniciar consulta <ArrowRight size={16} /></button>
        </div>
      ) : (
        <div className="customer-query-list">
          {sorted.map((item) => {
            const pending = item.status === 'PENDING';
            // O botão de download só aparece quando o PDF existe de fato —
            // concluída sem PDF ainda significa "processando o laudo".
            const hasPdf = Boolean(item.query?.reportPdfGeneratedAt);
            const completed = item.query?.companyStatus === 'COMPLETED' && hasPdf;
            const awaitingPdf = item.query?.companyStatus === 'COMPLETED' && !hasPdf;
            return (
              <article className={`customer-query-card${pending ? ' is-pending' : ''}`} key={item.id}>
                <div className="customer-query-card-head">
                  <div>
                    <span className="customer-eyebrow">{item.product.name}</span>
                    <h3>{item.plate}</h3>
                    <small>{new Date(item.createdAt).toLocaleDateString('pt-BR')} · {item.totalCents != null ? (item.totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</small>
                  </div>
                  <span className={`customer-query-status ${(item.query?.companyStatus || item.status).toLowerCase()}`}>{statusLabel(item)}</span>
                </div>
                <p>{statusHint(item)}</p>
                {completed && (
                  <div className="customer-query-result">
                    <strong>Relatório disponível</strong>
                    <span>{item.query?.report?.agregados?.marca ? `${item.query.report.agregados.marca} ${item.query.report.agregados.modelo || ''}` : 'Resultado recebido pela plataforma.'}</span>
                    <a className="customer-query-download" href={`/api/account/queries/${item.id}/pdf`} target="_blank" rel="noreferrer"><ArrowDownToLine size={15} /> Baixar relatório</a>
                  </div>
                )}
                {awaitingPdf && (
                  <div className="customer-query-result">
                    <strong>Gerando o laudo…</strong>
                    <span>A consulta foi concluída e o PDF está sendo preparado. Volte em instantes e use o botão Atualizar status.</span>
                  </div>
                )}
                {pending && (
                  <div className="customer-query-actions">
                    <Link
                      className="customer-primary-button"
                      href={`/checkout?produto=${encodeURIComponent(item.product.slug)}&placa=${encodeURIComponent(item.plate)}`}
                    >
                      Continuar pagamento <ArrowRight size={15} />
                    </Link>
                    <button
                      className="customer-danger-button"
                      onClick={() => removeOrder(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? <LoaderCircle size={15} className="spin" /> : <Trash2 size={15} />}
                      {deletingId === item.id ? ' Excluindo…' : ' Excluir'}
                    </button>
                  </div>
                )}
                {!pending && !completed && item.status !== 'CANCELLED' && (
                  <div className="customer-query-actions">
                    <button className="customer-secondary-button" onClick={onReload}><RefreshCw size={15} /> Atualizar status</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {error && <p className="customer-inline-error">{error}</p>}

      <div className="customer-lifecycle">
        <div className="customer-lifecycle-head">
          <div><span className="customer-eyebrow">COMO FUNCIONA O ANDAMENTO</span><h2>Do pedido ao relatório</h2></div>
          <span className="customer-demo-badge">ETAPAS ILUSTRATIVAS</span>
        </div>
        <div className="customer-lifecycle-steps">
          <article><span className="lifecycle-step-icon"><Check size={17} /></span><small>01 · PEDIDO</small><h3>Pagamento confirmado</h3><p>O status será atualizado após a confirmação do checkout.</p></article>
          <article><span className="lifecycle-step-icon pending"><Clock3 size={17} /></span><small>02 · PROCESSAMENTO</small><h3>Consulta pendente</h3><p>A solicitação aguarda o retorno do provedor integrado.</p></article>
          <article><span className="lifecycle-step-icon"><FileText size={17} /></span><small>03 · ENTREGA</small><h3>Relatório disponível</h3><p>O resultado poderá ser visualizado e baixado nesta área.</p></article>
        </div>
      </div>
    </section>
  );
}
