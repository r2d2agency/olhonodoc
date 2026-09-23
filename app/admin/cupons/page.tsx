'use client';

import { FormEvent, useEffect, useState } from 'react';

type Coupon = { id: string; code: string; description: string | null; discountType: string; value: number; status: string; redemptionCount: number; maxRedemptions: number | null };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'FIXED', value: '0' });

  async function load() {
    const response = await fetch('/api/admin/coupons');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar cupons');
    setCoupons(data);
  }
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: Number(form.value) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Falha ao criar cupom');
      setForm({ code: '', description: '', discountType: 'FIXED', value: '0' }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao criar cupom'); } finally { setSaving(false); }
  }

  return <main className="admin-cms"><header className="admin-cms-header"><div><span className="admin-cms-kicker">PRODUTOS / VENDAS</span><h1>Cupons</h1><p>Crie descontos e acompanhe sua utilização.</p></div></header>
    {error && <div className="admin-cms-message error">{error}</div>}
    <form onSubmit={create} className="admin-coupon-form admin-cms-card">
      <input required placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="admin-input" />
      <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" />
      <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="admin-input"><option value="FIXED">Valor fixo (centavos)</option><option value="PERCENTAGE">Percentual</option></select>
      <input required min="0" type="number" placeholder="Valor" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="admin-input" />
      <button disabled={saving} className="admin-cms-primary">{saving ? 'Salvando…' : 'Criar cupom'}</button>
    </form>
    <div className="overflow-hidden rounded-xl border bg-white"><table className="w-full text-left"><thead><tr className="border-b text-sm text-slate-500"><th className="p-4">Código</th><th>Desconto</th><th>Status</th><th>Resgates</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id} className="border-b"><td className="p-4 font-medium">{coupon.code}</td><td>{coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : `${coupon.value} centavos`}</td><td>{coupon.status}</td><td>{coupon.redemptionCount}{coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}</td></tr>)}</tbody></table></div>
  </main>;
}
