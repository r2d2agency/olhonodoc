'use client';

import { useEffect, useState } from 'react';

type Banner = { id: string; title: string; subtitle: string; imageUrl: string; href: string; enabled: boolean };

export default function BannersAdminPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', href: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/admin/banners').then((response) => response.json()).then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setMessage('Não foi possível carregar os banners.')); }, []);

  async function save(next: Banner[]) {
    setSaving(true);
    const response = await fetch('/api/admin/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    const data = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) { setMessage(data?.error || 'Não foi possível salvar.'); return; }
    setItems(Array.isArray(data) ? data : next);
    setMessage('Banners salvos.');
  }

  function add() {
    if (!form.title.trim() || !form.imageUrl.trim()) { setMessage('Informe o título e a imagem do banner.'); return; }
    void save([...items, { ...form, id: crypto.randomUUID(), enabled: true }]);
    setForm({ title: '', subtitle: '', imageUrl: '', href: '' });
  }

  function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setMessage('Escolha uma imagem de até 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, imageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / BANNERS</span><h1>Banners da home</h1><p>Crie chamadas visuais para destacar produtos e campanhas.</p></div></header>
    {message && <div className="admin-cms-message">{message}</div>}
    <section className="admin-cms-card"><h2>Novo banner</h2><div className="admin-media-form"><input placeholder="Título" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })}/><input placeholder="Subtítulo" value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })}/><input placeholder="Imagem URL" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}/><input placeholder="Link opcional" value={form.href} onChange={(event) => setForm({ ...form, href: event.target.value })}/><label className="admin-secondary-button">Carregar imagem<input hidden type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])}/></label><button disabled={saving} onClick={add}>Adicionar</button></div></section>
    <section className="admin-media-grid">{items.map((item) => <article className="admin-media-item" key={item.id}><img src={item.imageUrl} alt={item.title}/><div><strong>{item.title}</strong><small>{item.subtitle}</small><label><input type="checkbox" checked={item.enabled} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, enabled: event.target.checked } : entry))}/> Ativo</label><button disabled={saving} onClick={() => void save(items)}>Salvar</button><button disabled={saving} onClick={() => void save(items.filter((entry) => entry.id !== item.id))}>Excluir</button></div></article>)}{!items.length && <p>Nenhum banner cadastrado.</p>}</section>
  </main>;
}
