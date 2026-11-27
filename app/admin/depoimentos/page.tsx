'use client';

import { useEffect, useState } from 'react';
import { Check, Save, Trash2 } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type Testimonial = { id: string; type: 'text' | 'video'; name: string; text: string; photoUrl: string; youtubeUrl: string; active: boolean; sortOrder: number };

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/testimonials').then(async r => { const b = await readJson(r); if (!r.ok) throw new Error(b.error || 'Erro ao carregar.'); setItems(b.data); }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  function update(id: string, patch: Partial<Testimonial>) { setItems(items.map(t => t.id === id ? { ...t, ...patch } : t)); }
  function uploadPhoto(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) { setError('A foto deve ter no máximo 2 MB.'); return; }
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setError('Use uma imagem PNG, JPG ou WebP.'); return; }
    const reader = new FileReader();
    reader.onload = () => update(id, { photoUrl: String(reader.result || '') });
    reader.onerror = () => setError('Não foi possível ler a imagem.');
    reader.readAsDataURL(file);
  }
  function add(type: 'text' | 'video') { setItems([...items, { id: `new-${Date.now()}`, type, name: '', text: '', photoUrl: '', youtubeUrl: '', active: true, sortOrder: items.length + 1 }]); }

  async function save() {
    setSaving(true); setError(''); setMessage('');
    try {
      const r = await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
      const b = await readJson(r);
      if (!r.ok) throw new Error(b.error || 'Erro ao salvar.');
      setMessage('Depoimentos publicados.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / PROVA SOCIAL</span><h1>Depoimentos</h1><p>Depoimentos em texto com foto ou vídeos do YouTube exibidos na home.</p></div></header>
    {error && <div className="admin-cms-message error">{error}</div>}
    {message && <div className="admin-cms-message">{message}</div>}
    {loading ? <div className="admin-cms-card"><p>Carregando…</p></div> : <section className="admin-cms-card">
      {items.map((t, i) => <div className="admin-testimonial-row" key={t.id}>
        <div className="admin-testimonial-head"><strong>#{i + 1} · {t.type === 'video' ? 'Vídeo' : 'Texto'}</strong><button type="button" onClick={() => setItems(items.filter(x => x.id !== t.id))} aria-label="Remover"><Trash2 size={15}/></button></div>
        <div className="admin-form-grid">
          <label>Tipo<select value={t.type} onChange={e => update(t.id, { type: e.target.value as 'text' | 'video' })}><option value="text">Texto com foto</option><option value="video">Vídeo do YouTube</option></select></label>
          <label>Nome da pessoa<input value={t.name} onChange={e => update(t.id, { name: e.target.value })} placeholder="Nome completo"/></label>
          {t.type === 'text' && <>
            <label className="wide">Depoimento<textarea rows={3} value={t.text} onChange={e => update(t.id, { text: e.target.value })} placeholder="O que a pessoa disse"/></label>
            <label className="wide">Foto — enviar do computador<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => uploadPhoto(t.id, e.target.files?.[0])}/></label>
            {t.photoUrl && <div className="admin-testimonial-photo"><img src={t.photoUrl} alt="Prévia"/><button type="button" onClick={() => update(t.id, { photoUrl: '' })}>Remover foto</button></div>}
            <label className="wide">Ou URL da foto<input value={t.photoUrl.startsWith('data:') ? '' : t.photoUrl} onChange={e => update(t.id, { photoUrl: e.target.value })} placeholder="https://..."/></label>
          </>}
          {t.type === 'video' && <label className="wide">Link do YouTube<input value={t.youtubeUrl} onChange={e => update(t.id, { youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..."/></label>}
          <label>Ordem<input type="number" value={t.sortOrder} onChange={e => update(t.id, { sortOrder: Number(e.target.value) })}/></label>
          <label className="admin-settings-check"><input type="checkbox" checked={t.active} onChange={e => update(t.id, { active: e.target.checked })}/> Ativo</label>
        </div>
      </div>)}
      <div className="admin-cms-actions"><button type="button" className="admin-secondary-button" onClick={() => add('text')}>+ Depoimento com texto</button><button type="button" className="admin-secondary-button" onClick={() => add('video')}>+ Vídeo do YouTube</button><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : <><Save size={15}/> Salvar e publicar</>}</button></div>
    </section>}
  </main>;
}
