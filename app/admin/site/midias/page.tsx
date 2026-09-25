'use client';

import { useEffect, useMemo, useState } from 'react';

type Media = { id: string; name: string; url: string; alt: string; category: string };
const categories = ['Site', 'Home', 'Blog', 'Banners', 'Produtos'];

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [form, setForm] = useState({ name: '', url: '', alt: '', category: 'Site' });
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/media').then((response) => response.json()).then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => setMessage('Não foi possível carregar as mídias.'));
  }, []);

  async function save(next: Media[]) {
    setSaving(true);
    const response = await fetch('/api/admin/media', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    const data = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) { setMessage(data?.error || 'Erro ao salvar.'); return; }
    setItems(Array.isArray(data) ? data : next);
    setMessage('Mídia salva.');
  }

  function add() {
    if (!form.name.trim() || !form.url.trim()) { setMessage('Informe o nome e a URL da mídia.'); return; }
    void save([...items, { ...form, id: crypto.randomUUID(), name: form.name.trim() }]);
    setForm({ name: '', url: '', alt: '', category: 'Site' });
  }

  function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setMessage('Escolha uma imagem de até 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, name: current.name || file.name.replace(/\.[^.]+$/, ''), url: String(reader.result), alt: current.alt || file.name }));
    reader.readAsDataURL(file);
  }

  const visible = useMemo(() => items.filter((item) => (!filter || `${item.name} ${item.alt}`.toLowerCase().includes(filter.toLowerCase())) && (categoryFilter === 'Todas' || item.category === categoryFilter)), [items, filter, categoryFilter]);

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / MÍDIAS</span><h1>Biblioteca de mídias</h1><p>Carregue imagens do computador ou cadastre URLs públicas.</p></div></header>
    {message && <div className="admin-cms-message">{message}</div>}
    <section className="admin-cms-card"><h2>Adicionar mídia</h2><div className="admin-media-form"><input placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/><input placeholder="URL https://..." value={form.url.startsWith('data:') ? '' : form.url} onChange={(event) => setForm({ ...form, url: event.target.value })}/><input placeholder="Texto alternativo" value={form.alt} onChange={(event) => setForm({ ...form, alt: event.target.value })}/><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><label className="admin-secondary-button">Carregar arquivo<input type="file" accept="image/*" hidden onChange={(event) => upload(event.target.files?.[0])}/></label><button disabled={saving} onClick={add}>Adicionar</button></div>{form.url.startsWith('data:') && <small>Imagem carregada e pronta para salvar.</small>}</section>
    <section className="admin-panel-card"><div className="admin-toolbar"><input placeholder="Filtrar mídias..." value={filter} onChange={(event) => setFilter(event.target.value)}/><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>Todas</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div></section>
    <section className="admin-media-grid">{visible.map((item) => <article className="admin-media-item" key={item.id}><img src={item.url} alt={item.alt || item.name}/><div><strong>{item.name}</strong><small>{item.category}</small><button disabled={saving} onClick={() => void save(items.filter((current) => current.id !== item.id))}>Excluir</button></div></article>)}{!visible.length && <p>Nenhuma mídia encontrada.</p>}</section>
  </main>;
}
