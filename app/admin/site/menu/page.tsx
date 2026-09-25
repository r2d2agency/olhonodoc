'use client';

import { useEffect, useState } from 'react';

type MenuItem = { id: string; label: string; href: string; parentId: string | null; enabled: boolean };

const defaults: MenuItem[] = [
  { id: 'consultas', label: 'Consultas', href: '/consultas', parentId: null, enabled: true },
  { id: 'como-funciona', label: 'Como funciona', href: '/como-funciona', parentId: null, enabled: true },
  { id: 'relatorio', label: 'Exemplo de relatório', href: '/exemplo-relatorio', parentId: null, enabled: true },
  { id: 'precos', label: 'Preços', href: '/precos', parentId: null, enabled: true },
  { id: 'blog', label: 'Conteúdos', href: '/blog', parentId: null, enabled: true },
  { id: 'conta', label: 'Minha conta', href: '/minha-conta', parentId: null, enabled: true },
];

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({ label: '', href: '/' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/menu')
      .then((response) => response.json())
      .then((data) => setItems(Array.isArray(data) && data.length ? data : defaults))
      .catch(() => setMessage('Não foi possível carregar o menu.'))
      .finally(() => setLoading(false));
  }, []);

  async function save(next: MenuItem[]) {
    setSaving(true);
    setMessage('');
    const response = await fetch('/api/admin/menu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    const data = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) { setMessage(data?.error || 'Não foi possível salvar.'); return; }
    setItems(Array.isArray(data) ? data : next);
    setMessage('Menu salvo.');
  }

  function add() {
    if (!form.label.trim() || !form.href.trim()) { setMessage('Informe o nome e o endereço do item.'); return; }
    const next = [...items, { id: crypto.randomUUID(), label: form.label.trim(), href: form.href.trim(), parentId: null, enabled: true }];
    setForm({ label: '', href: '/' });
    void save(next);
  }

  if (loading) return <main className="admin-cms"><p>Carregando menu...</p></main>;

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / MENU</span><h1>Menu principal</h1><p>Organize os links exibidos na navegação pública.</p></div></header>
    {message && <div className="admin-cms-message">{message}</div>}
    <section className="admin-cms-card"><h2>Adicionar item</h2><div className="admin-media-form"><input placeholder="Nome do item" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })}/><input placeholder="Destino, ex.: /blog" value={form.href} onChange={(event) => setForm({ ...form, href: event.target.value })}/><button disabled={saving} onClick={add}>Adicionar</button></div></section>
    <section className="admin-panel-card"><div className="cms-section-list">{items.map((item, index) => <div className="cms-section-row" key={item.id}><span className="drag-handle">☰</span><div className="menu-item-fields"><input value={item.label} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, label: event.target.value } : entry))}/><input value={item.href} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, href: event.target.value } : entry))}/></div><label><input type="checkbox" checked={item.enabled} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, enabled: event.target.checked } : entry))}/> Ativo</label><button className="table-action" disabled={saving} onClick={() => void save(items)}>Salvar</button><button className="table-action" disabled={saving} onClick={() => void save(items.filter((entry) => entry.id !== item.id))}>Excluir</button>{index > 0 && <button className="table-action" disabled={saving} onClick={() => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; void save(next); }}>Subir</button>}</div>)}</div></section>
  </main>;
}
