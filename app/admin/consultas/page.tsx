'use client';
import { FormEvent, useState, useEffect } from 'react';

type AdminQuery = {
  id: string;
  normalizedPlate: string;
  queriedAt: string;
  providerProduct?: string | null;
  environment?: string | null;
  companyStatus?: string | null;
  providerAction?: number | null;
  providerMessage?: string | null;
  providerStatusText?: string | null;
  codigoConsulta?: string | null;
  hashPesquisa?: string | null;
  requestSentAt?: string | null;
  responseReceivedAt?: string | null;
  attempts?: number;
  lastError?: string | null;
  report?: Record<string, any> | null;
  reportPdfGeneratedAt?: string | null;
  order: { id: string; plate: string; status: string; createdAt: string; product: { name: string }; customer: { name: string | null; email: string | null } | null };
};

const statuses = ['', 'SUBMITTED', 'PROCESSING', 'COMPLETED', 'NOT_FOUND', 'AUTH_ERROR', 'INVALID_INPUT', 'NO_CREDITS', 'FORBIDDEN', 'EXPIRED', 'FAILED'];

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Enviada — aguardando Company',
  PROCESSING: 'Em processamento na Company',
  COMPLETED: 'Concluída',
  NOT_FOUND: 'Veículo não encontrado',
  AUTH_ERROR: 'Erro de autenticação',
  INVALID_INPUT: 'Entrada inválida',
  NO_CREDITS: 'Sem créditos disponíveis',
  FORBIDDEN: 'Acesso negado',
  EXPIRED: 'Consulta expirada',
  FAILED: 'Falhou',
};

const brDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('pt-BR') : null);

/** Espera o webhook: enviada para a Company e sem retorno registrado. */
function awaitingWebhook(query: AdminQuery) {
  if (query.responseReceivedAt) return false;
  if (!query.requestSentAt) return false;
  return !query.companyStatus || query.companyStatus === 'SUBMITTED' || query.companyStatus === 'PROCESSING';
}

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [plate, setPlate] = useState('');
  const [product, setProduct] = useState('');
  const [status, setStatus] = useState('');
  const [environment, setEnvironment] = useState('');
  const [sent, setSent] = useState('');
  const [received, setReceived] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispatching, setDispatching] = useState('');
  const [expanded, setExpanded] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (plate) params.set('plate', plate);
      if (product) params.set('product', product);
      if (status) params.set('status', status);
      if (environment) params.set('environment', environment);
      if (sent) params.set('sent', sent);
      if (received) params.set('received', received);
      const response = await fetch(`/api/admin/queries?${params.toString()}`);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Não foi possível carregar consultas');
      setQueries(body.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function search(event: FormEvent) { event.preventDefault(); void load(); }

  async function dispatch(orderId: string) {
    setDispatching(orderId); setError('');
    try {
      const response = await fetch('/api/admin/queries/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível enviar a consulta.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao enviar consulta.'); }
    finally { setDispatching(''); }
  }

  return <main className="admin-cms">
    <header className="admin-cms-header">
      <div>
        <span className="admin-cms-kicker">OPERAÇÃO / CONSULTAS</span>
        <h1>Central de consultas</h1>
        <p>Quem solicitou, o que foi enviado à Company, a resposta recebida pelo webhook e o relatório gerado.</p>
      </div>
      <form className="admin-order-table-search" onSubmit={search}>
        <input className="admin-input" placeholder="Buscar placa" value={plate} onChange={e => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}/>
        <button className="admin-cms-primary" type="submit">Filtrar</button>
      </form>
    </header>

    <section className="admin-panel-card admin-query-filters">
      <div className="admin-toolbar">
        <select value={product} onChange={e => setProduct(e.target.value)}>
          <option value="">Todos os produtos</option>
          <option value="conferi-agregados">Conferi Agregados</option>
          <option value="conferi-auto-pericia-gold">Auto Perícia Gold</option>
          <option value="conferi-bin">Base BIN + RF</option>
          <option value="conferi-estadual">Base Estadual</option>
          <option value="conferi-crlv">CRLV</option>
          <option value="conferi-gravame">Gravame</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status Company</option>
          {statuses.slice(1).map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={environment} onChange={e => setEnvironment(e.target.value)}>
          <option value="">Todos os ambientes</option>
          <option value="homologation">Homologação</option>
          <option value="production">Produção</option>
        </select>
        <select value={sent} onChange={e => setSent(e.target.value)}>
          <option value="">Envio: todos</option>
          <option value="true">Já enviado</option>
          <option value="false">Não enviado</option>
        </select>
        <select value={received} onChange={e => setReceived(e.target.value)}>
          <option value="">Retorno: todos</option>
          <option value="true">Já recebido</option>
          <option value="false">Aguardando retorno</option>
        </select>
        <button className="admin-secondary-button" onClick={() => void load()}>Aplicar filtros</button>
      </div>
    </section>

    <div className="admin-order-summary">
      <span>Registros encontrados: <strong>{queries.length}</strong></span>
      <span>Aguardando webhook: <strong>{queries.filter(awaitingWebhook).length}</strong></span>
      <span>PDF gerado: <strong>{queries.filter(item => item.reportPdfGeneratedAt).length}</strong></span>
    </div>

    {error && <div className="admin-cms-message error">{error}</div>}

    <div className="admin-order-table">
      <table>
        <thead>
          <tr>
            <th>Quem solicitou</th>
            <th>Placa</th>
            <th>Data / hora</th>
            <th>Tipo de consulta</th>
            <th>Status</th>
            <th>Resposta</th>
            <th>Relatório</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {!loading && queries.map(query => {
            const waiting = awaitingWebhook(query);
            const hasPdf = Boolean(query.reportPdfGeneratedAt);
            const sentAt = brDateTime(query.requestSentAt);
            const receivedAt = brDateTime(query.responseReceivedAt);
            const requester = query.order.customer?.name || query.order.customer?.email || 'Cliente';
            return <QueryRow key={query.id} query={query} requester={requester} waiting={waiting} hasPdf={hasPdf} sentAt={sentAt} receivedAt={receivedAt} expanded={expanded === query.id} onToggle={() => setExpanded(current => current === query.id ? '' : query.id)} dispatching={dispatching} onDispatch={() => dispatch(query.order.id)} />;
          })}
          {!loading && queries.length === 0 && <tr><td colSpan={8}>Nenhuma consulta encontrada.</td></tr>}
          {loading && <tr><td colSpan={8}>Carregando consultas…</td></tr>}
        </tbody>
      </table>
    </div>
  </main>;
}

type RowProps = {
  query: AdminQuery;
  requester: string;
  waiting: boolean;
  hasPdf: boolean;
  sentAt: string | null;
  receivedAt: string | null;
  expanded: boolean;
  onToggle: () => void;
  dispatching: string;
  onDispatch: () => void;
};

function QueryRow({ query, requester, waiting, hasPdf, sentAt, receivedAt, expanded, onToggle, dispatching, onDispatch }: RowProps) {
  const statusKey = (query.companyStatus || 'pending').toLowerCase();
  const label = query.companyStatus ? (statusLabels[query.companyStatus] || query.companyStatus) : 'Não enviada';
  const response = query.providerMessage || query.providerStatusText || query.lastError || '—';
  const reportReady = query.companyStatus === 'COMPLETED';
  const canDispatch = !query.companyStatus || query.companyStatus === 'FAILED';

  return <>
    <tr>
      <td>
        <strong>{requester}</strong>
        <small>{query.order.customer?.email || '—'}</small>
        <small>Pedido {query.order.id.slice(-8).toUpperCase()} · {query.order.status}</small>
      </td>
      <td><strong>{query.normalizedPlate}</strong><small>{query.order.plate}</small></td>
      <td>
        <small>Solicitação: {brDateTime(query.queriedAt) || '—'}</small>
        <small>Envio p/ Company: {sentAt || 'não enviado'}</small>
        <small>Retorno: {receivedAt || 'aguardando'}</small>
      </td>
      <td>
        <strong>{query.order.product.name}</strong>
        <small>{query.providerProduct || 'Sem vínculo com a Company'}</small>
        <small>{query.environment || '—'} · {query.codigoConsulta ? `cód. ${query.codigoConsulta}` : 'sem código'}</small>
      </td>
      <td>
        <span className={`admin-order-status ${statusKey}`}>{label}</span>
        <small>Ação {query.providerAction ?? '—'} · {query.attempts ?? 0} tentativa(s)</small>
        {waiting && <small className="query-waiting-text">Aguardando webhook da Company</small>}
        {query.lastError && <small className="query-error-text">{query.lastError}</small>}
      </td>
      <td>
        <small>{response}</small>
        <small>{query.responseReceivedAt ? `Recebido em ${receivedAt}` : 'Sem resposta registrada'}</small>
        <button className="table-action" type="button" onClick={onToggle}>{expanded ? 'Ocultar resposta' : 'Ver resposta'}</button>
      </td>
      <td>
        {hasPdf
          ? <a className="table-action" href={`/api/admin/queries/${query.id}/pdf`} target="_blank" rel="noreferrer">Baixar PDF</a>
          : <small>{reportReady ? 'PDF não gerado' : 'Aguardando conclusão'}</small>}
        {hasPdf && <small>Gerado em {brDateTime(query.reportPdfGeneratedAt)}</small>}
        {query.report && <small>JSON da resposta disponível</small>}
      </td>
      <td>
        {canDispatch && <button className="table-action" onClick={onDispatch} disabled={Boolean(dispatching)}>{dispatching === query.order.id ? 'Enviando…' : 'Enviar consulta'}</button>}
        {!canDispatch && !reportReady && <small>Reprocessamento automático ativo</small>}
      </td>
    </tr>
    {expanded && <tr className="admin-query-detail-row">
      <td colSpan={8}>
        <div className="admin-query-detail">
          <div className="admin-query-detail-head">
            <strong>Resposta da Company · {query.normalizedPlate}</strong>
            <span>Código {query.codigoConsulta || '—'} · hash {query.hashPesquisa ? `${query.hashPesquisa.slice(0, 24)}…` : '—'}</span>
          </div>
          <pre>{query.report ? JSON.stringify(query.report, null, 2) : 'Nenhuma resposta registrada até o momento.'}</pre>
        </div>
      </td>
    </tr>}
  </>;
}
