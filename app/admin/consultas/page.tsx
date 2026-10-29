'use client';
import { FormEvent, useState, useEffect } from 'react';
import { Search } from 'lucide-react';

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

/** Respeita limite de tamanho: nunca joga um stack trace inteiro na tabela. */
const truncate = (value?: string | null, max = 80) => {
  if (!value) return '';
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

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
  const [selected, setSelected] = useState<AdminQuery | null>(null);
const [regenerating, setRegenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState('');
  const [regenMessage, setRegenMessage] = useState('');

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

  async function regeneratePdfs() {
    setRegenerating(true); setRegenMessage('');
    try {
      const response = await fetch('/api/admin/queries/regenerate-pdfs', { method: 'POST' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Não foi possível regenerar.');
      setRegenMessage(body.message || 'PDFs antigos limpos.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao regenerar.'); }
    finally { setRegenerating(false); }
  }

  async function generatePdf(queryId: string) {
    setGeneratingPdf(queryId); setError('');
    try {
      const response = await fetch(`/api/admin/queries/${queryId}/pdf/generate`, { method: 'POST' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Não foi possível gerar o PDF.');
      setRegenMessage(body.message || 'PDF gerado.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao gerar PDF.'); }
    finally { setGeneratingPdf(''); }
  }
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
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="admin-secondary-button" type="button" onClick={() => void regeneratePdfs()} disabled={regenerating}>{regenerating ? 'Regenerando…' : 'Regenerar PDFs antigos'}</button>
        {regenMessage && <span className="admin-cms-message success">{regenMessage}</span>}
        <form className="admin-order-table-search" onSubmit={search} style={{ margin: 0 }}>
          <input className="admin-input" placeholder="Buscar placa" value={plate} onChange={e => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}/>
          <button className="admin-cms-primary" type="submit">Filtrar</button>
        </form>
      </div>
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

    <div className="admin-order-table query-table">
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
            <th className="query-col-action">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {!loading && queries.map(query => <QueryRow key={query.id} query={query} onOpen={() => setSelected(query)} />)}
          {!loading && queries.length === 0 && <tr><td colSpan={8}>Nenhuma consulta encontrada.</td></tr>}
          {loading && <tr><td colSpan={8}>Carregando consultas…</td></tr>}
        </tbody>
      </table>
    </div>

    {selected && <QueryDetailModal query={selected} dispatching={dispatching} generatingPdf={generatingPdf} onClose={() => setSelected(null)} onDispatch={() => dispatch(selected.order.id)} onGeneratePdf={() => void generatePdf(selected.id)} />}
  </main>;
}

function QueryRow({ query, onOpen }: { query: AdminQuery; onOpen: () => void }) {
  const statusKey = (query.companyStatus || 'pending').toLowerCase();
  const label = query.companyStatus ? (statusLabels[query.companyStatus] || query.companyStatus) : 'Não enviada';
  const requester = query.order.customer?.name || query.order.customer?.email || 'Cliente';
  const responseShort = truncate(query.providerMessage || query.providerStatusText || query.lastError, 80) || '—';
  const hasPdf = Boolean(query.reportPdfGeneratedAt);
  const reportReady = query.companyStatus === 'COMPLETED';

  return <tr>
    <td>
      <strong>{requester}</strong>
      <small>{query.order.customer?.email || '—'}</small>
      <small>Pedido {query.order.id.slice(-8).toUpperCase()} · {query.order.status}</small>
    </td>
    <td><strong>{query.normalizedPlate}</strong><small>{query.order.plate}</small></td>
    <td>
      <small>Solicitação: {brDateTime(query.queriedAt) || '—'}</small>
      <small>Envio p/ Company: {brDateTime(query.requestSentAt) || 'não enviado'}</small>
      <small>Retorno: {brDateTime(query.responseReceivedAt) || 'aguardando'}</small>
    </td>
    <td>
      <strong>{query.order.product.name}</strong>
      <small>{query.providerProduct || 'Sem vínculo com a Company'}</small>
      <small>{query.environment || '—'} · {query.codigoConsulta ? `cód. ${query.codigoConsulta}` : 'sem código'}</small>
    </td>
    <td>
      <span className={`admin-order-status ${statusKey}`}>{label}</span>
      <small>Ação {query.providerAction ?? '—'} · {query.attempts ?? 0} tentativa(s)</small>
      {awaitingWebhook(query) && <small className="query-waiting-text">Aguardando webhook da Company</small>}
      {query.lastError && <small className="query-error-text" title={query.lastError}>{truncate(query.lastError, 60)}</small>}
    </td>
    <td><small title={query.providerMessage || query.providerStatusText || query.lastError || ''}>{responseShort}</small></td>
    <td>
      {hasPdf
        ? <a className="table-action" href={`/api/admin/queries/${query.id}/pdf`} target="_blank" rel="noreferrer">Baixar PDF</a>
        : <small>{reportReady ? 'PDF não gerado' : 'Aguardando conclusão'}</small>}
    </td>
    <td className="query-col-action">
      <button className="query-lupa-btn" type="button" onClick={onOpen} title="Ver detalhes da consulta" aria-label={`Ver detalhes da consulta ${query.normalizedPlate}`}>
        <Search size={16} />
      </button>
    </td>
  </tr>;
}

function QueryDetailModal({ query, dispatching, generatingPdf, onClose, onDispatch, onGeneratePdf }: { query: AdminQuery; dispatching: string; generatingPdf: string; onClose: () => void; onDispatch: () => void; onGeneratePdf: () => void }) {
  const requester = query.order.customer?.name || query.order.customer?.email || 'Cliente';
  const canDispatch = !query.companyStatus || query.companyStatus === 'FAILED';
  const label = query.companyStatus ? (statusLabels[query.companyStatus] || query.companyStatus) : 'Não enviada';

  return <div className="query-modal-overlay" onClick={onClose}>
    <div className="query-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
      <div className="query-modal-head">
        <div>
          <span className="admin-cms-kicker">DETALHES DA CONSULTA</span>
          <h2>{query.normalizedPlate} · {query.order.product.name}</h2>
        </div>
        <button className="query-modal-close" type="button" onClick={onClose} aria-label="Fechar">✕</button>
      </div>

      <div className="query-modal-grid">
        <div>
          <h3>Quem solicitou</h3>
          <p><strong>{requester}</strong></p>
          <p>{query.order.customer?.email || '—'}</p>
          <p>Pedido {query.order.id.slice(-8).toUpperCase()} · {query.order.status}</p>
          <p>Solicitação: {brDateTime(query.queriedAt) || '—'}</p>
        </div>
        <div>
          <h3>Envio à Company</h3>
          <p>Produto: {query.providerProduct || 'Sem vínculo'}</p>
          <p>Ambiente: {query.environment || '—'}</p>
          <p>Código: {query.codigoConsulta || '—'}</p>
          <p>Hash: {query.hashPesquisa || '—'}</p>
          <p>Enviado em: {brDateTime(query.requestSentAt) || 'não enviado'}</p>
          <p>Tentativas: {query.attempts ?? 0}</p>
        </div>
        <div>
          <h3>Retorno (webhook)</h3>
          <p>Status: <strong>{label}</strong></p>
          <p>Ação: {query.providerAction ?? '—'}</p>
          <p>Mensagem: {query.providerMessage || '—'}</p>
          <p>Status texto: {query.providerStatusText || '—'}</p>
          <p>Recebido em: {brDateTime(query.responseReceivedAt) || 'aguardando'}</p>
        </div>
      </div>

      {query.lastError && <div className="query-modal-error">
        <h3>Erro completo</h3>
        <pre>{query.lastError}</pre>
      </div>}

      <div className="query-modal-error">
        <h3>Resposta da Company (JSON)</h3>
        <pre>{query.report ? JSON.stringify(query.report, null, 2) : 'Nenhuma resposta registrada até o momento.'}</pre>
      </div>

      <div className="query-modal-actions">
        {canDispatch && <button className="admin-cms-primary" type="button" onClick={onDispatch} disabled={Boolean(dispatching)}>{dispatching === query.order.id ? 'Enviando…' : 'Enviar consulta'}</button>}
        {query.companyStatus === 'COMPLETED' && query.report && <button className="admin-cms-primary" type="button" onClick={onGeneratePdf} disabled={generatingPdf === query.id}>{generatingPdf === query.id ? 'Gerando…' : 'Gerar PDF para o cliente'}</button>}
        <button className="admin-secondary-button" type="button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  </div>;
}
