'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CarFront, Check, CircleHelp, Clock3, CreditCard, LoaderCircle, LockKeyhole, MapPin, ShieldCheck, User } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
import { captureAttribution, trackEvent } from '@/lib/tracking';
import PaymentMethodSelector from './payment-method-selector';

type Address = { postalCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string };
const emptyAddress: Address = { postalCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
type Aggregate = Record<string, unknown>;

export default function CheckoutForm({ product, plate }: { product: CatalogProduct; plate: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<{ orderId: string; amountCents: number | null } | null>(null);
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

  useEffect(() => {
    fetch('/api/account/profile').then(r => r.json()).then(body => { if (body.data) { setCpf(body.data.cpf || ''); setPhone(body.data.phone || ''); const a = body.data; setAddress({ postalCode: a.postalCode || '', street: a.street || '', number: a.number || '', complement: a.complement || '', neighborhood: a.neighborhood || '', city: a.city || '', state: a.state || '' }); } }).catch(() => undefined);
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
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/checkout/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productSlug: product.slug, plate, cpf, phone, address }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setOrder(body.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível preparar o checkout.'); }
    finally { setLoading(false); }
  }

  async function pay() {
    if (!order) return;
    setPaymentLoading(true); setError('');
    try {
      const response = await fetch('/api/checkout/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.orderId }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
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

  if (order) return <main className="checkout-page"><div className="checkout-shell"><section className="checkout-card"><span className="checkout-step-indicator"><span className="done">1</span><span className="done">2</span><span className="active">3</span></span><span className="eyebrow">PEDIDO PREPARADO</span><h1>Seu pedido está pronto para pagamento.</h1><p>Pedido <strong>{order.orderId.slice(-8).toUpperCase()}</strong> criado com sucesso. Continue para o ambiente seguro do provedor de pagamento.</p><div className="checkout-order-summary"><div><small>Produto</small><strong>{product.name}</strong></div><div><small>Placa</small><strong>{plate}</strong></div><div><small>Valor</small><strong>{product.price}</strong></div></div>{error && <p className="form-error">{error}</p>}{!paymentProvider && <button className="button" onClick={pay} disabled={paymentLoading}>{paymentLoading ? <LoaderCircle className="spin" size={17}/> : <CreditCard size={17}/>} {paymentLoading ? 'Abrindo pagamento…' : 'Ir para pagamento'}</button>}{paymentProvider === 'mercadopago' && <PaymentMethodSelector orderId={order.orderId} publicKey={publicKey} amountCents={order.amountCents || 0} payerEmail="" payerCpf={cpf} methods={paymentMethods} onSuccess={() => { window.location.assign('/minha-conta'); }} onError={setError}/>}{paymentProvider === 'asaas' && checkoutUrl && <button className="button" onClick={() => window.location.assign(checkoutUrl)}><CreditCard size={17}/> Ir para pagamento</button>}<Link href="/minha-conta" className="button secondary">Ir para minha conta</Link></section></div></main>;

  return <main className="checkout-page"><div className="checkout-shell">
    <section className="checkout-card">
      <span className="checkout-step-indicator"><span className={step >= 1 ? 'active' : ''}>1</span><span className={step >= 2 ? 'active' : ''}>2</span><span>3</span></span>
      <span className="eyebrow">ETAPA {step} · {step === 1 ? 'SEUS DADOS' : 'REVISÃO'}</span>
      <h1>{step === 1 ? 'Finalize os dados da sua compra.' : 'Revise seu pedido.'}</h1>
      <p>{step === 1 ? `Você escolheu ${product.name} para a placa ${plate}. Precisamos de alguns dados para preparar o pedido.` : 'Confira as informações antes de seguir para o pagamento.'}</p>

      {step === 1 && <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
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
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit">Revisar pedido <ArrowRight size={17}/></button>
      </form>}

      {step === 2 && <form onSubmit={submit}>
        <div className="checkout-section">
          <h3><User size={16}/> Dados pessoais</h3>
          <div className="checkout-review-grid">
            <div><small>CPF/CNPJ</small><strong>{cpf}</strong></div>
            <div><small>WhatsApp</small><strong>{phone}</strong></div>
          </div>
          <button type="button" className="checkout-edit-btn" onClick={() => setStep(1)}><ArrowLeft size={14}/> Editar</button>
        </div>
        <div className="checkout-section">
          <h3><CreditCard size={16}/> Pagamento</h3>
          <p className="checkout-hint">O pagamento será processado de forma transparente, sem redirecionamento externo.</p>
        </div>
        <div className="checkout-section">
          <h3><MapPin size={16}/> Endereço</h3>
          <div className="checkout-review-grid">
            <div><small>CEP</small><strong>{address.postalCode}</strong></div>
            <div><small>Endereço</small><strong>{address.street}, {address.number}{address.complement ? ` — ${address.complement}` : ''}</strong></div>
            <div><small>Bairro</small><strong>{address.neighborhood}</strong></div>
            <div><small>Cidade/UF</small><strong>{address.city}/{address.state}</strong></div>
          </div>
          <button type="button" className="checkout-edit-btn" onClick={() => setStep(1)}><ArrowLeft size={14}/> Editar</button>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17}/> : <LockKeyhole size={17}/>} {loading ? 'Preparando…' : 'Confirmar e ir para pagamento'}</button>
      </form>}
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
      <div className="checkout-price-row"><span>Total</span><strong className="checkout-price">{product.price}</strong></div>
      <div className="checkout-secure"><ShieldCheck size={14}/> Pagamento processado pelo provedor configurado</div>
    </aside>
  </div></main>;
}
