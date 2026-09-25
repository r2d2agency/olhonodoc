'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Megaphone, Plus } from 'lucide-react';

type Campaign = { id: string; name: string; source: string; medium: string; campaign: string; content: string | null; targetUrl: string; status: string; createdAt: string };
const statusLabels: Record<string, { label: string; tone: string }> = { DRAFT: { label: 'Rascunho', tone: 'warning' }, PUBLISHED: { label: 'Publicada', tone: 'success' }, ARCHIVED: { label: 'Arquivada', tone: 'neutral' } };
const emptyForm = { name: '', source: '', medium: '', campaign: '', content: '', targetUrl: 'https://' };

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => { fetch('/api/admin/campaigns').then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setItems(body.data || []); }).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar campanhas.')); }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    const response = await fetch('/api/admin/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body = await response.json(); setSaving(false);
    if (!response.ok) { setError(body.error || 'Não foi possível criar a campanha.'); return; }
    setItems((current) => [body.data, ...current]); setForm(emptyForm); setMessage('Campanha criada.');
  }

  async function setStatus(item: Campaign, status: string) {
    const response = await fetch(`/api/admin/campaigns/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    else setError('Não foi possível atualizar a campanha.');
  }

  async function remove(item: Campaign) {
    if (!window.confirm(`Excluir a campanha "${item.name}"? Esta ação não pode ser desfeita.`)) return;
    const response = await fetch(`/api/admin/campaigns/${item.id}`, { method: 'DELETE' });
    if (response.ok) setItems((current) => current.filter((entry) => entry.id !== item.id));
    else setError('Não foi possível excluir a campanha.');
  }

  function trackingUrl(item: Campaign) {
    const url = new URL(item.targetUrl);
    url.searchParams.set('utm_source', item.source);
    url.searchParams.set('utm_medium', item.medium);
    url.searchParams.set('utm_campaign', item.campaign);
    if (item.content) url.searchParams.set('utm_content', item.content);
    return url.toString();
  }

  async function copy(item: Campaign) {
    try { await navigator.clipboard.writeText(trackingUrl(item)); setCopiedId(item.id); setTimeout(() => setCopiedId(''), 2000); } catch { setError('Não foi possível copiar automaticamente.'); }
  }

  const field = (label: string, key: keyof typeof emptyForm, placeholder: string, required = false) => <label>{label}<input value={form[key]} placeholder={placeholder} required={required} onChange={(event) => setForm({ ...form, [key]: event.target.value })}/></label>;

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">MARKETING / CAMPANHAS</span><h1>Campanhas</h1><p>Cadastre campanhas com UTMs e copie os links rastreáveis para usar nos anúncios.</p></div></header>
    {message && <div className="admin-cms-message">{message}</div>}
    {error && <div className="admin-cms-message error">{error}</div>}
    <section className="admin-cms-card">
      <div className="admin-cms-card-heading"><div><span className="admin-eyebrow">NOVA CAMPANHA</span><h2>Criar campanha rastreável</h2></div><Megaphone size={20}/></div>
      <form className="admin-utm-form" onSubmit={create}>
        {field('Nome da campanha', 'name', 'Ex.: Verão 2027 — Consulta Premium', true)}
        {field('URL de destino', 'targetUrl', 'https://olhonodoc.com.br/consultas/consulta-premium', true)}
        {field('Origem · utm_source', 'source', 'google, instagram, newsletter', true)}
        {field('Mídia · utm_medium', 'medium', 'cpc, social, email', true)}
        {field('Campanha · utm_campaign', 'campaign', 'verao-2027-consulta-premium', true)}
        {field('Conteúdo · utm_content (opcional)', 'content', 'criativo-a, banner-topo')}
        <div className="wide"><button className="admin-cms-primary" type="submit" disabled={saving}><Plus size={15}/>{saving ? 'Criando…' : 'Criar campanha'}</button></div>
      </form>
    </section>
    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">CADASTRADAS</span><h2>Campanhas ({items.length})</h2></div></div>
      <div className="admin-order-table admin-table-wrap"><table className="admin-table"><thead><tr><th>Campanha</th><th>Parâmetros</th><th>Link rastreável</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {items.map((item) => <tr key={item.id}>
          <td><strong>{item.name}</strong><small>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</small></td>
          <td><small>source: <b>{item.source}</b></small><small>medium: <b>{item.medium}</b></small><small>campaign: <b>{item.campaign}</b></small>{item.content && <small>content: <b>{item.content}</b></small>}</td>
          <td><code className="admin-tracking-url">{trackingUrl(item)}</code></td>
          <td><span className={`admin-status ${statusLabels[item.status]?.tone || 'neutral'}`}><i/>{statusLabels[item.status]?.label || item.status}</span></td>
          <td>
            <div className="admin-table-actions">
              <button className="table-action" onClick={() => copy(item)}>{copiedId === item.id ? <><Check size={13}/> Copiado</> : <><Copy size={13}/> Copiar link</>}</button>
              {item.status !== 'PUBLISHED' && <button className="table-action" onClick={() => setStatus(item, 'PUBLISHED')}>Publicar</button>}
              {item.status === 'PUBLISHED' && <button className="table-action" onClick={() => setStatus(item, 'ARCHIVED')}>Arquivar</button>}
              <button className="table-action" onClick={() => remove(item)}>Excluir</button>
            </div>
          </td>
        </tr>)}
      </tbody></table></div>
      {!items.length && <p className="admin-chart-note">Nenhuma campanha cadastrada ainda. Crie a primeira acima.</p>}
    </section>
  </main>;
}
