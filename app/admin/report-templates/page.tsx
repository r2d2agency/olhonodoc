'use client';

import { useEffect, useState } from 'react';
import { FileText, Save } from 'lucide-react';

type Template = { id: string; name: string; html: string; updatedAt?: string };

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeId, setActiveId] = useState('');
  const [draft, setDraft] = useState<Template>({ id: '', name: '', html: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/report-templates').then(async (r) => { const b = await r.json(); if (!r.ok) throw new Error(b.error); setTemplates(b.data.templates || []); setActiveId(b.data.activeId || ''); }).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar.'));
  }, []);

  async function save() {
    setSaving(true); setError(''); setMessage('');
    const r = await fetch('/api/admin/report-templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templates }) });
    const b = await r.json(); setSaving(false);
    if (!r.ok) { setError(b.error || 'Não foi possível salvar.'); return; }
    setMessage('Templates salvos.');
  }

  async function setActive(id: string) {
    setActiveId(id);
    await fetch('/api/admin/report-templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeId: id }) });
  }

  async function addOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.html.trim()) { setError('Informe nome e HTML.'); return; }
    const next = [...templates.filter((t) => t.id !== draft.id), { ...draft, id: draft.id || crypto.randomUUID(), updatedAt: new Date().toISOString() }];
    setTemplates(next);
    setDraft({ id: '', name: '', html: '' });
  }

  return (
    <main className="admin-cms">
      <header className="admin-cms-header"><div><span className="admin-cms-kicker">LAUDOS / TEMPLATES</span><h1>Templates de laudo</h1><p>Escolha o template ativo (usado em HTML e PDF) ou crie novos modelos.</p></div></header>
      {message && <div className="admin-cms-message">{message}</div>}
      {error && <div className="admin-cms-message error">{error}</div>}
      <section className="admin-cms-card">
        <div className="admin-cms-card-heading"><div><span className="admin-eyebrow">{draft.id ? 'EDITANDO' : 'NOVO TEMPLATE'}</span><h2>{draft.id ? draft.name : 'Criar template'}</h2></div><FileText size={20} /></div>
        <form className="admin-utm-form" onSubmit={addOrUpdate}>
          <label>Nome do template<input value={draft.name} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label className="wide">HTML do template (use __DATA__ como placeholder)<textarea rows={12} value={draft.html} required onChange={(e) => setDraft({ ...draft, html: e.target.value })} /></label>
          <div className="wide admin-template-actions">
            <button className="admin-cms-primary" type="submit"><Save size={15} /> {draft.id ? 'Atualizar rascunho' : 'Adicionar template'}</button>
          </div>
        </form>
      </section>
      <section className="admin-panel-card">
        <div className="admin-card-heading"><div><span className="admin-eyebrow">CADASTRADOS</span><h2>Templates ({templates.length})</h2></div></div>
        <ul>
          {templates.map((t) => (
            <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span><strong>{t.name}</strong> {activeId === t.id && <em>(ativo)</em>}</span>
              <span>
                <button className="table-action" onClick={() => setActive(t.id)}>Ativar</button>
                <button className="table-action" onClick={() => setDraft(t)}>Editar</button>
              </span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
      </section>
    </main>
  );
}