'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: 'FIXED' | 'PERCENTAGE';
  value: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  startsAt: string | null;
  endsAt: string | null;
  maxRedemptions: number | null;
  perCustomerLimit: number | null;
  minOrderCents: number | null;
  maxDiscountCents: number | null;
  productId: string | null;
  redemptionCount: number;
  product: { id: string; name: string } | null;
};

type Product = { id: string; name: string };

const currency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateInput = (value: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const emptyForm = {
  code: '',
  description: '',
  discountType: 'FIXED' as 'FIXED' | 'PERCENTAGE',
  value: '',
  startsAt: '',
  endsAt: '',
  maxRedemptions: '',
  perCustomerLimit: '',
  minOrderCents: '',
  maxDiscountCents: '',
  productId: '',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const response = await fetch('/api/admin/coupons');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar cupons');
    setCoupons(data.data || []);
  }

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json().catch(() => ({}));
      if (response.ok) setProducts(data.data || []);
    } catch { /* lista de produtos é opcional para o formulário */ }
  }

  useEffect(() => { load().catch((e) => setError(e.message)); loadProducts(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          maxRedemptions: form.maxRedemptions || null,
          perCustomerLimit: form.perCustomerLimit || null,
          minOrderCents: form.minOrderCents ? Math.round(Number(form.minOrderCents) * 100) : null,
          maxDiscountCents: form.maxDiscountCents ? Math.round(Number(form.maxDiscountCents) * 100) : null,
          productId: form.productId || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Falha ao criar cupom');
      setForm(emptyForm);
      setNotice(`Cupom ${data.data.code} criado.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao criar cupom'); }
    finally { setSaving(false); }
  }

  async function update(coupon: Coupon, changes: Partial<Coupon>) {
    setError(''); setNotice('');
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || 'Não foi possível atualizar o cupom'); return; }
    await load();
  }

  async function remove(coupon: Coupon) {
    setError(''); setNotice('');
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || 'Não foi possível remover o cupom'); return; }
    setNotice(`Cupom ${coupon.code} removido.`);
    await load();
  }

  const discountLabel = (coupon: Coupon) => coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : currency(coupon.value);

  return <main className="admin-cms">
    <header className="admin-cms-header">
      <div>
        <span className="admin-cms-kicker">PRODUTOS / VENDAS</span>
        <h1>Cupons</h1>
        <p>Crie descontos e acompanhe sua utilização. O desconto é abatido do valor antes de gerar Pix, boleto ou cartão.</p>
      </div>
    </header>

    {error && <div className="admin-cms-message error">{error}</div>}
    {notice && <div className="admin-cms-message">{notice}</div>}

    <form onSubmit={create} className="admin-cms-card admin-coupon-editor">
      <h2 className="admin-coupon-editor-title"><Plus size={16}/> Novo cupom</h2>
      <div className="admin-form-grid">
        <label className="admin-field">Código do cupom<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EX: BLACKFRIDAY" maxLength={32}/></label>
        <label className="admin-field">Descrição<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Campanha de BLACK FRIDAY"/></label>
        <label className="admin-field">Tipo de desconto<select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'FIXED' | 'PERCENTAGE' })}><option value="FIXED">Valor fixo (R$)</option><option value="PERCENTAGE">Percentual (%)</option></select></label>
        <label className="admin-field">{form.discountType === 'PERCENTAGE' ? 'Percentual' : 'Valor do desconto (R$)'}<input required min="0" step="0.01" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '10.00'}/></label>
        <label className="admin-field">Válido de<input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}/></label>
        <label className="admin-field">Válido até<input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })}/></label>
        <label className="admin-field">Limite total de usos<input min="0" type="number" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} placeholder="Sem limite"/></label>
        <label className="admin-field">Limite por cliente<input min="0" type="number" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} placeholder="Sem limite"/></label>
        <label className="admin-field">Pedido mínimo (R$)<input min="0" step="0.01" type="number" value={form.minOrderCents} onChange={(e) => setForm({ ...form, minOrderCents: e.target.value })} placeholder="Sem mínimo"/></label>
        <label className="admin-field">Desconto máximo (R$)<input min="0" step="0.01" type="number" value={form.maxDiscountCents} onChange={(e) => setForm({ ...form, maxDiscountCents: e.target.value })} placeholder="Sem teto"/></label>
        <label className="admin-field">Produto específico<select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Todos os produtos</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      </div>
      <button disabled={saving} className="admin-cms-primary">{saving ? 'Salvando…' : 'Criar cupom'}</button>
    </form>

    <div className="admin-cms-card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Código</th><th>Desconto</th><th>Validade</th><th>Limites</th><th>Resgates</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {!coupons.length && <tr><td colSpan={7}>Nenhum cupom criado ainda.</td></tr>}
            {coupons.map((coupon) => <tr key={coupon.id}>
              <td><strong>{coupon.code}</strong><small className="table-muted">{coupon.description || '—'}</small></td>
              <td>{discountLabel(coupon)}{coupon.product && <small className="table-muted">{coupon.product.name}</small>}</td>
              <td>{coupon.startsAt || coupon.endsAt ? <small>{dateInput(coupon.startsAt) || '—'} → {dateInput(coupon.endsAt) || '—'}</small> : '—'}</td>
              <td><small>{coupon.maxRedemptions ? `Total ${coupon.maxRedemptions}` : 'Total ∞'}{coupon.perCustomerLimit ? ` · Cliente ${coupon.perCustomerLimit}` : ''}{coupon.minOrderCents ? ` · Mín ${currency(coupon.minOrderCents)}` : ''}{coupon.maxDiscountCents ? ` · Teto ${currency(coupon.maxDiscountCents)}` : ''}</small></td>
              <td>{coupon.redemptionCount}{coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}</td>
              <td><select aria-label="Status do cupom" value={coupon.status} onChange={(e) => update(coupon, { status: e.target.value as Coupon['status'] })}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="ARCHIVED">Arquivado</option></select></td>
              <td><button className="table-action" onClick={() => remove(coupon)}><Trash2 size={14}/> Remover</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </main>;
}
