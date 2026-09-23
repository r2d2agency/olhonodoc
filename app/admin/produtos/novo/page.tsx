'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter(); const [form, setForm] = useState({ name: '', slug: '', priceCents: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(''); const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, priceCents: Number(form.priceCents) }) }); const data = await response.json().catch(() => ({})); if (!response.ok) setError(data.error || 'Não foi possível criar o produto'); else router.push(`/admin/produtos/${data.data.slug}`); setSaving(false); }
  return <main className="admin-cms"><header className="admin-cms-header"><div><span className="admin-cms-kicker">PRODUTOS / NOVO</span><h1>Novo produto</h1><p>Cadastre uma consulta para o catálogo.</p></div></header>{error && <div className="admin-cms-message error">{error}</div>}<form className="admin-cms-card admin-product-form" onSubmit={submit}><label>Nome<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Slug<input required pattern="[a-z0-9-]+" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}/></label><label>Preço em centavos<input required type="number" min="0" value={form.priceCents} onChange={e => setForm({ ...form, priceCents: e.target.value })}/></label><button className="admin-cms-primary" disabled={saving}>{saving ? 'Criando…' : 'Criar produto'}</button></form></main>;
}
