'use client';

import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

type Props = {
  method: 'pix' | 'card';
  onFinish: () => void;
  delayMs?: number;
};

/** Confirmação visual após o provedor aprovar a cobrança. Redireciona sozinho. */
export default function PaymentSuccess({ method, onFinish, delayMs = 1800 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, delayMs);
    return () => clearTimeout(timer);
  }, [onFinish, delayMs]);

  const label = method === 'pix' ? 'Pix confirmado' : 'Pagamento aprovado';
  return <div className="payment-success" role="status" aria-live="polite">
    <div className="payment-success-ring">
      <CheckCircle2 size={72} strokeWidth={1.8} />
    </div>
    <h2>Pagamento concluído!</h2>
    <p>{label}. Sua consulta foi confirmada e já está sendo processada.</p>
    <div className="payment-success-bar"><span /></div>
    <small>Você será direcionado para sua conta…</small>
  </div>;
}
