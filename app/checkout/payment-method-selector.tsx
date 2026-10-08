'use client';

import { useState } from 'react';
import { CreditCard, LoaderCircle, LockKeyhole, QrCode, Receipt } from 'lucide-react';
import MercadoPagoCardForm from './mercadopago-card-form';

type Props = {
  orderId: string;
  publicKey: string;
  amountCents: number;
  payerEmail: string;
  payerCpf: string;
  methods: { card: boolean; pix: boolean; boleto: boolean };
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function PaymentMethodSelector({ orderId, publicKey, amountCents, payerEmail, payerCpf, methods, onSuccess, onError }: Props) {
  const [selected, setSelected] = useState<'card' | 'pix' | 'boleto' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
  const [boletoData, setBoletoData] = useState<{ ticketUrl: string } | null>(null);

  const available: Array<{ id: 'card' | 'pix' | 'boleto'; label: string; icon: React.ReactNode }> = [];
  if (methods.card) available.push({ id: 'card', label: 'Cartão de crédito', icon: <CreditCard size={18} /> });
  if (methods.pix) available.push({ id: 'pix', label: 'Pix', icon: <QrCode size={18} /> });
  if (methods.boleto) available.push({ id: 'boleto', label: 'Boleto', icon: <Receipt size={18} /> });

  async function generateOffline(method: 'pix' | 'boleto') {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/checkout/offline-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method, payerIdentification: { type: 'CPF', number: payerCpf.replace(/\D/g, '') } }),
      });
      const raw = await response.text();
      let body: any = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error(`HTTP ${response.status} — o servidor não respondeu com JSON. Verifique o container e os logs.`); }
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status} — não foi possível gerar a cobrança.`);
      if (method === 'pix') setPixData({ qrCode: body.data.qrCode, qrCodeBase64: body.data.qrCodeBase64 });
      else setBoletoData({ ticketUrl: body.data.ticketUrl });
    } catch (e) { const message = e instanceof Error ? e.message : 'Não foi possível gerar a cobrança.'; setError(message); onError(message); }
    finally { setLoading(false); }
  }

  if (selected === 'card') {
    return <MercadoPagoCardForm orderId={orderId} publicKey={publicKey} amountCents={amountCents} payerEmail={payerEmail} payerCpf={payerCpf} onSuccess={onSuccess} onError={onError} />;
  }

  if (selected === 'pix' && pixData) {
    return (
      <div className="checkout-offline-result">
        <div className="checkout-offline-header"><QrCode size={20} /><span>Pague com Pix</span></div>
        {pixData.qrCodeBase64 && <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" className="checkout-pix-qr" />}
        {pixData.qrCode && <textarea readOnly value={pixData.qrCode} className="checkout-pix-code" rows={4} />}
        <p className="checkout-hint">Escaneie o QR Code com o app do seu banco para pagar. A confirmação é automática.</p>
        <button className="button" onClick={onSuccess}><LockKeyhole size={17} /> Já paguei</button>
      </div>
    );
  }

  if (selected === 'boleto' && boletoData) {
    return (
      <div className="checkout-offline-result">
        <div className="checkout-offline-header"><Receipt size={20} /><span>Boleto gerado</span></div>
        <p className="checkout-hint">Clique abaixo para abrir o boleto. A confirmação pode levar até 2 dias úteis.</p>
        <a className="button" href={boletoData.ticketUrl} target="_blank" rel="noopener noreferrer"><LockKeyhole size={17} /> Abrir boleto</a>
        <button className="button secondary" onClick={onSuccess}>Já paguei</button>
      </div>
    );
  }

  return (
    <div className="checkout-method-selector">
      <div className="checkout-method-grid">
        {available.map(method => (
          <button key={method.id} type="button" className="checkout-method-option" onClick={() => { setSelected(method.id); if (method.id === 'pix' || method.id === 'boleto') generateOffline(method.id); }}>
            {method.icon}
            <span>{method.label}</span>
          </button>
        ))}
      </div>
      {loading && <div className="checkout-aggregate-status"><LoaderCircle size={16} className="spin" /> Gerando cobrança…</div>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
