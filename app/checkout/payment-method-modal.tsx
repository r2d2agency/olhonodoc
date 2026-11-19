'use client';

import { CreditCard, QrCode, Receipt, X } from 'lucide-react';

export type PaymentMethodId = 'card' | 'pix' | 'boleto';

type Props = {
  open: boolean;
  amountLabel: string;
  methods: { card: boolean; pix: boolean; boleto: boolean };
  onChoose: (method: PaymentMethodId) => void;
  onClose: () => void;
};

export default function PaymentMethodModal({ open, amountLabel, methods, onChoose, onClose }: Props) {
  if (!open) return null;
  const options = [
    ...(methods.pix ? [{ id: 'pix' as const, icon: <QrCode size={26}/>, label: 'Pix', hint: 'Aprovação imediata' }] : []),
    ...(methods.card ? [{ id: 'card' as const, icon: <CreditCard size={26}/>, label: 'Cartão de crédito', hint: 'Parcele em até 12x' }] : []),
    ...(methods.boleto ? [{ id: 'boleto' as const, icon: <Receipt size={26}/>, label: 'Boleto', hint: 'Compensa em até 3 dias úteis' }] : []),
  ];
  return <div className="payment-modal-backdrop" role="dialog" aria-modal="true" aria-label="Escolha a forma de pagamento">
    <div className="payment-modal">
      <button type="button" className="payment-modal-close" onClick={onClose} aria-label="Fechar"><X size={18}/></button>
      <span className="eyebrow">PAGAMENTO</span>
      <h2>Como você quer pagar?</h2>
      <p>Total do pedido: <strong>{amountLabel}</strong></p>
      <div className="payment-modal-options">
        {options.map(option => <button key={option.id} type="button" className="payment-modal-option" onClick={() => onChoose(option.id)}>
          {option.icon}
          <span><strong>{option.label}</strong><small>{option.hint}</small></span>
        </button>)}
      </div>
      <p className="payment-modal-note">Seus dados são processados com segurança. A confirmação aparece na sua conta após o pagamento.</p>
    </div>
  </div>;
}
