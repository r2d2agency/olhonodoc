'use client';

import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { readJson } from '@/lib/client-response';

export default function ExampleReportAdmin() {
  const [name, setName] = useState('');
  const [hasPdf, setHasPdf] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/example-report').then(async r => { const b = await readJson(r); setName(b.name || ''); setHasPdf(Boolean(b.dataUrl)); }).catch(() => undefined);
  }, []);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(''); setMessage('');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setError('Escolha um arquivo PDF.'); return; }
    if (file.size > 8_000_000) { setError('O PDF deve ter no máximo 8 MB.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      setSaving(true);
      try {
        const r = await fetch('/api/admin/example-report', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: String(reader.result), name: file.name }) });
        const b = await readJson(r);
        if (!r.ok) throw new Error(b.error || 'Erro ao salvar.');
        setHasPdf(true); setName(file.name); setMessage('PDF de exemplo publicado.');
      } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar.'); }
      finally { setSaving(false); }
    };
    reader.onerror = () => setError('Não foi possível ler o PDF.');
    reader.readAsDataURL(file);
  }

  async function remove() {
    setSaving(true);
    await fetch('/api/admin/example-report', { method: 'DELETE' });
    setHasPdf(false); setName(''); setMessage('PDF removido.');
    setSaving(false);
  }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / EXEMPLO DE RELATÓRIO</span><h1>PDF de exemplo</h1><p>O PDF enviado aqui é exibido na página "Ver exemplo de relatório".</p></div></header>
    {error && <div className="admin-cms-message error">{error}</div>}
    {message && <div className="admin-cms-message">{message}</div>}
    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">ARQUIVO</span><h2>Enviar modelo</h2><p>Use um PDF com dados fictícios. Máximo 8 MB.</p></div><Save size={20}/></div>
      <div className="admin-form-grid">
        <label className="wide">Escolher PDF<input type="file" accept="application/pdf,.pdf" onChange={e => upload(e.target.files?.[0])}/></label>
        <label>Nome do arquivo<input value={name} onChange={e => setName(e.target.value)} readOnly/></label>
      </div>
      <div className="admin-cms-actions">
        {hasPdf && <a className="admin-secondary-button" href="/api/public/example-report" target="_blank" rel="noopener">Ver PDF publicado</a>}
        {hasPdf && <button className="admin-secondary-button" onClick={remove} disabled={saving}><Trash2 size={14}/> Remover PDF</button>}
      </div>
    </section>
  </main>;
}
