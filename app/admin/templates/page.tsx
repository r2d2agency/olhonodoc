'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';

type Template = { id: string; name: string; channel: 'email' | 'whatsapp'; subject: string; body: string; updatedAt?: string };
const emptyTemplate: Template = { id: '', name: '', channel: 'email', subject: '', body: '' };
const variables = ['{{nome}}', '{{produto}}', '{{placa}}', '{{valor}}', '{{pedido}}', '{{link}}'];

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [draft, setDraft] = useState<Template>(emptyTemplate);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/admin/templates').then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setItems(body.data || []); }).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar templates.')); }, []);

  async function save(next: Template[]) {
    setSaving(true); setError(''); setMessage('');
    const response = await fetch('/api/admin/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templates: next }) });
    const body = await response.json(); setSaving(false);
    if (!response.ok) { setError(body.error || 'Não foi possível salvar.'); return false; }
    setItems(body.data); setMessage('Templates salvos.'); return true;
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.body.trim()) { setError('Informe nome e corpo do template.'); return; }
    const ok = await save([...items.filter((item) => item.id !== draft.id), { ...draft, id: draft.id || crypto.randomUUID() }]);
    if (ok) setDraft(emptyTemplate);
  }

  async function remove(id: string) { if (!window.confirm('Excluir este template?')) return; await save(items.filter((item) => item.id !== id)); }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">MARKETING / TEMPLATES</span><h1>Templates de mensagem</h1><p>Modelos de e-mail e WhatsApp com variáveis preenchidas automaticamente no envio.</p></div></header>
    {message && <div className="admin-cms-message">{message}</div>}
    {error && <div className="admin-cms-message error">{error}</div>}
    <section className="admin-cms-card">
      <div className="admin-cms-card-heading"><div><span className="admin-eyebrow">{draft.id ? 'EDITANDO' : 'NOVO TEMPLATE'}</span><h2>{draft.id ? draft.name || 'Editar template' : 'Criar template'}</h2></div><FileText size={20}/></div>
      <form className="admin-utm-form" onSubmit={add}>
        <label>Nome do template<input value={draft.name} placeholder="Ex.: Boas-vindas" required onChange={(event) => setDraft({ ...draft, name: event.target.value })}/></label>
        <label>Canal<select value={draft.channel} onChange={(event) => setDraft({ ...draft, channel: event.target.value as Template['channel'] })}><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option></select></label>
        <label className="wide">Assunto (e-mail)<input value={draft.subject} placeholder="Ex.: Sua consulta está pronta, {'{{nome}}'}" onChange={(event) => setDraft({ ...draft, subject: event.target.value })}/></label>
        <label className="wide">Corpo da mensagem<textarea rows={6} value={draft.body} placeholder="Olá {'{{nome}}'}, sua consulta da placa {'{{placa}}'} está pronta: {'{{link}}'}" required onChange={(event) => setDraft({ ...draft, body: event.target.value })}/></label>
        <div className="wide admin-template-variables"><span>Variáveis disponíveis:</span>{variables.map((variable) => <button type="button" key={variable} className="table-action" onClick={() => setDraft({ ...draft, body: `${draft.body}${variable}` })}>{variable}</button>)}</div>
        <div className="wide admin-template-actions">
          <button className="admin-cms-primary" type="submit" disabled={saving}><Save size={15}/>{saving ? 'Salvando…' : draft.id ? 'Salvar alterações' : 'Adicionar template'}</button>
          {draft.id && <button className="admin-secondary-button" type="button" onClick={() => setDraft(emptyTemplate)}>Cancelar edição</button>}
        </div>
      </form>
    </section>
    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">CADASTRADOS</span><h2>Templates ({items.length})</h2></div></div>
      <div className="admin-order-table admin-table-wrap"><table className="admin-table"><thead><tr><th>Template</th><th>Canal</th><th>Assunto</th><th>Atualizado</th><th>Ações</th></tr></thead><tbody>
        {items.map((item) => <tr key={item.id}>
          <td><strong>{item.name}</strong></td>
          <td><span className={`admin-status ${item.channel === 'whatsapp' ? 'success' : 'neutral'}`}><i/>{item.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</span></td>
          <td>{item.subject || '—'}</td>
          <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('pt-BR') : '—'}</td>
          <td><div className="admin-table-actions"><button className="table-action" onClick={() => { setDraft(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button><button className="table-action" onClick={() => remove(item.id)}><Trash2 size={13}/> Excluir</button></div></td>
        </tr>)}
      </tbody></table></div>
      {!items.length && <p className="admin-chart-note">Nenhum template cadastrado. Crie o primeiro acima.</p>}
    </section>
  </main>;
}
