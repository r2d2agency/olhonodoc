'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type PageKey = 'termos' | 'privacidade' | 'cookies' | 'reembolso' | 'sobre';
type Page = { title: string; content: string };
const KEYS: { key: PageKey; label: string }[] = [
  { key: 'termos', label: 'Termos de uso' },
  { key: 'privacidade', label: 'Política de privacidade' },
  { key: 'cookies', label: 'Política de cookies' },
  { key: 'reembolso', label: 'Política de reembolso' },
  { key: 'sobre', label: 'Página Sobre' },
];

export default function InstitutionalPagesAdmin() {
  const [pages, setPages] = useState<Record<PageKey, Page> | null>(null);
  const [selected, setSelected] = useState<PageKey>('termos');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/institutional-pages').then(async r => {
      const b = await readJson(r);
      if (!r.ok) throw new Error(b.error || 'Não foi possível carregar.');
      setPages(b.data);
    }).catch(e => setError(e.message));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!pages) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const r = await fetch('/api/admin/institutional-pages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: pages }) });
      const b = await readJson(r);
      if (!r.ok) throw new Error(b.error || 'Não foi possível salvar.');
      setPages(b.data);
      setMessage('Páginas institucionais publicadas.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setSaving(false); }
  }

  const current = pages?.[selected];
  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / PÁGINAS INSTITUCIONAIS</span><h1>Páginas do site</h1><p>Edite os textos oficiais publicados nas páginas legais e institucionais.</p></div><FileText size={22}/></header>
    {error && <div className="admin-cms-message error">{error}</div>}
    {message && <div className="admin-cms-message">{message}</div>}
    {!pages ? <div className="admin-cms-card"><p>Carregando…</p></div> : <form onSubmit={save} className="admin-cms-card">
      <div className="admin-template-tabs">{KEYS.map(({ key, label }) => <button type="button" key={key} className={selected === key ? 'active' : ''} onClick={() => setSelected(key)}>{label}</button>)}</div>
      {current && <div className="admin-form-grid">
        <label className="wide">Título da página<input value={current.title} maxLength={160} onChange={e => setPages({ ...pages, [selected]: { ...current, title: e.target.value } })}/></label>
        <label className="wide">Conteúdo (HTML simples: h2, p, strong, ul/li, a)<textarea rows={18} value={current.content} onChange={e => setPages({ ...pages, [selected]: { ...current, content: e.target.value } })}/></label>
      </div>}
      <div className="admin-cms-actions"><button className="admin-cms-primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : <><Check size={15}/> Salvar e publicar</>}</button></div>
    </form>}
  </main>;
}
