'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { CarFront, CircleHelp, Clock3, CreditCard, LoaderCircle, LockKeyhole, MapPin, ShieldCheck, Tag, User } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
import { captureAttribution, trackEvent } from '@/lib/tracking';
import PaymentMethodSelector from './payment-method-selector';

type Address = { postalCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string };
const emptyAddress: Address = { postalCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
type Aggregate = Record<string, unknown>;

export default function CheckoutForm({ product, plate }: { product: CatalogProduct; plate: string }) {
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<{ orderId: string; amountCents: number | null; subtotalCents: number; discountCents: number; totalCents: number; couponCode: string | null } | null>(null);
  const orderAmountCents = order ? (order.totalCents ?? order.amountCents ?? 0) : 0;
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [aggregateLoading, setAggregateLoading] = useState(false);
  const [aggregateError, setAggregateError] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'mercadopago' | 'asaas' | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<{ card: boolean; pix: boolean; boleto: boolean }>({ card: true, pix: true, boleto: true });
  const [payerEmail, setPayerEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discountCents: number; subtotalCents: number; totalCents: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code) { setCouponError('Informe o código do cupom.'); return; }
    setCouponLoading(true); setCouponError('');
    try {
      const response = await fetch('/api/checkout/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, productSlug: product.slug }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Não foi possível aplicar o cupom.');
      setCoupon(body.data); setCouponCode(body.data.code);
    } catch (e) { setCoupon(null); setCouponError(e instanceof Error ? e.message : 'Não foi possível aplicar o cupom.'); }
    finally { setCouponLoading(false); }
  }

  function removeCoupon() {
    setCoupon(null); setCouponCode(''); setCouponError('');
  }

  useEffect(() => {
    fetch('/api/account/profile').then(r => r.json()).then(body => { if (body.data) { setCpf(body.data.cpf || ''); setPhone(body.data.phone || ''); setPayerEmail(body.data.email || ''); const a = body.data; setAddress({ postalCode: a.postalCode || '', street: a.street || '', number: a.number || '', complement: a.complement || '', neighborhood: a.neighborhood || '', city: a.city || '', state: a.state || '' }); } }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!plate) return;
    setAggregateLoading(true); setAggregateError('');
    fetch('/api/account/aggregates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plate }) })
      .then(async r => { const body = await r.json(); if (!r.ok) throw new Error(body.error || 'Não foi possível consultar o veículo.'); if (body.data.status === 'PROCESSING') { setAggregateError('A Company recebeu a consulta e está processando os dados.'); return; } setAggregate(body.data.aggregates || null); })
      .catch(e => setAggregateError(e instanceof Error ? e.message : 'Não foi possível consultar o veículo.'))
      .finally(() => setAggregateLoading(false));
  }, [plate]);

  async function lookupCep() {
    const digits = address.postalCode.replace(/\D/g, '');
    if (digits.length !== 8) { setError('Informe um CEP válido com 8 dígitos.'); return; }
    setCepLoading(true); setError('');
    try {
      const response = await fetch(`/api/checkout/cep?cep=${digits}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'CEP não encontrado.');
      setAddress(a => ({ ...a, street: body.data.street, neighborhood: body.data.neighborhood, city: body.data.city, state: body.data.state }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível consultar o CEP.'); }
    finally { setCepLoading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); captureAttribution(); trackEvent('add_payment_info', { item_id: product.slug, value: product.price });
    // O e-mail identifica o pagador junto ao provedor de pagamento: sem ele a
    // cobrança é recusada. Falhar aqui é melhor do que falhar no checkout final.
    if (!payerEmail) { setError('Não foi possível identificar seu e-mail. Recarregue a página e entre novamente com sua conta.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/checkout/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productSlug: product.slug, plate, cpf, phone, address, couponCode: coupon ? coupon.code : '' }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setOrder(body.data);
      // Total zerado (cupom 100%): confirma o pedido na hora, sem tela de pagamento.
      if ((body.data.totalCents ?? body.data.amountCents ?? 0) <= 0) { await pay(body.data.orderId); return; }
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível preparar o checkout.'); }
    finally { setLoading(false); }
  }

  async function pay(pendingOrderId?: string) {
    if (!order && !pendingOrderId) return;
    setPaymentLoading(true); setError('');
    try {
      const response = await fetch('/api/checkout/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: pendingOrderId || order!.orderId }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (body.data.provider === 'free') {
        window.location.assign('/minha-conta?pedido=confirmado');
        return;
      }
      if (body.data.provider === 'mercadopago') {
        setPaymentProvider('mercadopago');
        setPublicKey(body.data.publicKey);
        setPaymentMethods(body.data.methods || { card: true, pix: true, boleto: true });
      } else {
        setPaymentProvider('asaas');
        setCheckoutUrl(body.data.checkoutUrl);
        window.location.assign(body.data.checkoutUrl);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível criar o pagamento.'); }
    finally { setPaymentLoading(false); }
  }

  // Pedido com valor zerado (cupom de 100%): confirma e envia direto, sem tela de pagamento.
  useEffect(() => { if (order && (order.totalCents ?? order.amountCents ?? 0) <= 0 && !paymentProvider) { pay(); } }, [order]);

  if (order) return <main className="checkout-page"><div className="checkout-shell"><section className="checkout-card"><span className="checkout-step-indicator"><span className="done">1</span><span className="active">2</span></span><span className="eyebrow">PAGAMENTO</span><h1>Escolha como pagar.</h1><p>Pedido <strong>{order.orderId.slice(-8).toUpperCase()}</strong> · {product.name} · placa <strong>{plate}</strong> · {brl(order.totalCents)}{order.couponCode ? ` (cupom ${order.couponCode})` : ''}.</p>{error && <p className="form-error">{error}</p>}{!paymentProvider && <button className="button" onClick={() => pay()} disabled={paymentLoading}>{paymentLoading ? <LoaderCircle className="spin" size={17}/> : <CreditCard size={17}/>} {paymentLoading ? 'Abrindo pagamento…' : 'Ir para pagamento'}</button>}{paymentProvider === 'mercadopago' && <PaymentMethodSelector orderId={order.orderId} publicKey={publicKey} amountCents={orderAmountCents} payerEmail={payerEmail} payerCpf={cpf} methods={paymentMethods} onSuccess={() => { window.location.assign('/minha-conta?pedido=confirmado'); }} onError={setError}/>}{paymentProvider === 'asaas' && checkoutUrl && <button className="button" onClick={() => window.location.assign(checkoutUrl)}><CreditCard size={17}/> Ir para pagamento</button>}<Link href="/minha-conta" className="button secondary">Ir para minha conta</Link></section></div></main>;

  return <main className="checkout-page"><div className="checkout-shell">
    <section className="checkout-card">
      <span className="checkout-step-indicator"><span className="active">1</span><span>2</span></span>
      <span className="eyebrow">SEUS DADOS</span>
      <h1>Preencha seus dados para pagar.</h1>
      <p>{`Você escolheu ${product.name} para a placa ${plate}. Preencha e confirme para ir ao pagamento.`}</p>

      <form onSubmit={submit}>
        <div className="checkout-section">
          <h3><User size={16}/> Dados pessoais</h3>
          <div className="checkout-grid">
            <label>CPF ou CNPJ<input required value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0000-00"/></label>
            <label>WhatsApp<input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000"/></label>
          </div>
        </div>
        <div className="checkout-section">
          <h3><MapPin size={16}/> Endereço</h3>
          <div className="checkout-grid">
            <label>CEP<input required value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} placeholder="00000-000" onBlur={lookupCep}/>{cepLoading && <small className="checkout-hint">Buscando…</small>}</label>
            <label>Rua<input required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Nome da rua"/></label>
            <label>Número<input required value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })} placeholder="123"/></label>
            <label>Complemento<input value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} placeholder="Apto, bloco (opcional)"/></label>
            <label>Bairro<input required value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })} placeholder="Bairro"/></label>
            <label>Cidade<input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Cidade"/></label>
            <label>UF<input required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value.toUpperCase() })} placeholder="UF" maxLength={2}/></label>
          </div>
        </div>
        <div className="checkout-section">
          <h3><Tag size={16}/> Cupom de desconto <small className="checkout-hint">(opcional)</small></h3>
          {coupon ? <div className="checkout-coupon-applied">
            <div><strong>{coupon.code}</strong><small>Desconto de {brl(coupon.discountCents)} aplicado</small></div>
            <button type="button" className="checkout-edit-btn" onClick={removeCoupon}>Remover</button>
          </div> : <div className="checkout-coupon-form">
            <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Código do cupom" aria-label="Código do cupom" maxLength={32}/>
            <button type="button" className="button secondary" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? <LoaderCircle className="spin" size={15}/> : null} {couponLoading ? 'Validando…' : 'Aplicar'}</button>
          </div>}
          {couponError && <p className="form-error">{couponError}</p>}
        </div>
        <div className="checkout-section">
          <h3><CreditCard size={16}/> Pagamento</h3>
          <p className="checkout-hint">Na próxima tela você escolhe cartão, Pix ou boleto. O pagamento é processado de forma transparente, sem redirecionamento externo.</p>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17}/> : <LockKeyhole size={17}/>} {loading ? 'Preparando…' : coupon && coupon.totalCents === 0 ? 'Confirmar pedido' : 'Confirmar e ir para pagamento'}</button>
      </form>
    </section>

    <aside className="checkout-summary">
      <span className="eyebrow">RESUMO DO PEDIDO</span>
      <h2>{product.name}</h2>
      <div className="checkout-vehicle-card">
        <div className="checkout-vehicle-icon"><CarFront size={22}/></div>
        <div><small>PLACA CONSULTADA</small><strong>{plate}</strong></div>
      </div>
      {aggregateLoading && <div className="checkout-aggregate-status"><Clock3 size={16}/> Buscando dados do veículo…</div>}
      {aggregateError && <div className="checkout-aggregate-status"><CircleHelp size={16}/> {aggregateError}</div>}
      {aggregate && <div className="checkout-aggregate-grid">
        {[['Marca', 'marca'], ['Modelo', 'modelo'], ['Ano', 'anoModelo'], ['Cor', 'cor'], ['Combustível', 'combustivel'], ['Situação', 'situacao'], ['UF', 'Uf'], ['Município', 'municipio']].map(([label, key]) => <div key={key}><small>{label}</small><strong>{String(aggregate[key] || 'Não informado')}</strong></div>)}
      </div>}
      <div className="checkout-price-row"><span>Subtotal</span><strong className="checkout-price">{brl(coupon ? coupon.subtotalCents : product.priceCents)}</strong></div>
      {coupon && coupon.discountCents > 0 && <div className="checkout-price-row checkout-price-discount"><span>Desconto ({coupon.code})</span><strong>-{brl(coupon.discountCents)}</strong></div>}
      <div className="checkout-price-row"><span>Total</span><strong className="checkout-price">{coupon ? brl(coupon.totalCents) : brl(product.priceCents)}</strong></div>
      <div className="checkout-secure"><ShieldCheck size={14}/> Pagamento processado pelo provedor configurado</div>
    </aside>
  </div></main>;
}
