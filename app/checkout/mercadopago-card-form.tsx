'use client';

import { FormEvent, useState } from 'react';
import { CreditCard, LoaderCircle, LockKeyhole } from 'lucide-react';

type Props = {
  orderId: string;
  publicKey: string;
  amountCents: number;
  payerEmail: string;
  payerCpf: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function MercadoPagoCardForm({ orderId, publicKey, amountCents, payerEmail, payerCpf, onSuccess, onError }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const cardTokenResponse = await fetch(`https://api.mercadopago.com/v1/card_tokens?public_key=${encodeURIComponent(publicKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: cardNumber.replace(/\s/g, ''),
          expiration_month: Number(expiry.split('/')[0]),
          expiration_year: Number(`20${expiry.split('/')[1]}`),
          security_code: cvv,
          cardholder: { name: cardName.toUpperCase(), identification: { type: 'CPF', number: payerCpf.replace(/\D/g, '') } },
        }),
      });
      const cardTokenBody = await cardTokenResponse.json();
      if (!cardTokenResponse.ok) throw new Error(cardTokenBody.message || 'Não foi possível tokenizar o cartão.');
      const paymentResponse = await fetch('/api/checkout/card-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          cardToken: cardTokenBody.id,
          paymentMethodId: 'visa',
          installments,
          payerIdentification: { type: 'CPF', number: payerCpf.replace(/\D/g, '') },
        }),
      });
      const paymentBody = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentBody.error || 'Não foi possível processar o pagamento.');
      if (paymentBody.data.status === 'APPROVED') { onSuccess(); return; }
      if (paymentBody.data.status === 'PENDING') { onSuccess(); return; }
      throw new Error('Pagamento não autorizado. Verifique os dados do cartão.');
    } catch (e) { const message = e instanceof Error ? e.message : 'Não foi possível processar o pagamento.'; setError(message); onError(message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="checkout-card-form">
      <div className="checkout-card-form-header">
        <CreditCard size={18} />
        <span>Pagamento com cartão</span>
      </div>
      <label>Número do cartão
        <input required value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19} />
      </label>
      <label>Nome no cartão
        <input required value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="NOME COMO ESTÁ NO CARTÃO" />
      </label>
      <div className="checkout-card-form-row">
        <label>Validade
          <input required value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" maxLength={5} />
        </label>
        <label>CVV
          <input required value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" maxLength={4} />
        </label>
      </div>
      <label>Parcelas
        <select value={installments} onChange={e => setInstallments(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}x de {(amountCents / 100 / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>)}
        </select>
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="button" type="submit" disabled={loading}>
        {loading ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}
        {loading ? 'Processando…' : 'Pagar agora'}
      </button>
    </form>
  );
}
