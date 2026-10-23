import nodemailer from 'nodemailer';
import { getSmtpConfiguration } from '@/lib/smtp-settings';

async function sendEmail(email: string, subject: string, text: string, html: string) {
  const settings = await getSmtpConfiguration();
  if (!settings) {
    if (process.env.NODE_ENV !== 'production') return;
    throw new Error('SMTP não configurado.');
  }
  const transport = nodemailer.createTransport({ host: settings.host, port: settings.port, secure: settings.secure, auth: { user: settings.user, pass: settings.password }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
  await Promise.race([
    transport.sendMail({ from: settings.from, to: email, subject, text, html }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP_TIMEOUT')), 20000)),
  ]);
}

export async function sendLoginCode(email: string, code: string) {
  await sendEmail(email, 'Seu código de acesso | Olho no Doc', `Seu código de acesso é ${code}. Ele expira em 10 minutos.`, `<div style="font-family:Arial,sans-serif"><h2>Olho no Doc</h2><p>Use este código para acessar sua conta:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>O código expira em 10 minutos.</p></div>`);
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  await sendEmail(email, 'Redefina sua senha | Olho no Doc', `Para redefinir sua senha, acesse: ${resetUrl}. O link expira em 30 minutos. Se você não solicitou esta alteração, ignore este e-mail.`, `<div style="font-family:Arial,sans-serif"><h2>Olho no Doc</h2><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetUrl}">Criar uma nova senha</a></p><p>O link expira em 30 minutos. Se você não solicitou esta alteração, ignore este e-mail.</p></div>`);
}

export async function sendBonusAccess(email: string, name: string, accessUrl: string, temporaryPassword: string) {
  await sendEmail(email, 'Sua consulta foi liberada | Olho no Doc', `Olá, ${name}. Sua consulta foi liberada. Acesse ${accessUrl} com o e-mail ${email} e a senha temporária ${temporaryPassword}. No primeiro acesso, você deverá trocar a senha.`, `<div style="font-family:Arial,sans-serif"><h2>Olho no Doc</h2><p>Olá, ${name}.</p><p>Sua consulta foi liberada pela nossa equipe.</p><p><a href="${accessUrl}">Acessar minha conta</a></p><p>E-mail: <strong>${email}</strong></p><p>Senha temporária: <strong>${temporaryPassword}</strong></p><p>Troque a senha no primeiro acesso.</p></div>`);
}

export async function sendSmtpTest(email: string) {
  await sendEmail(email, 'Teste de configuração de e-mail | Olho no Doc', 'A configuração de e-mail foi validada com sucesso.', '<div style="font-family:Arial,sans-serif"><h2>Olho no Doc</h2><p>A configuração de e-mail foi validada com sucesso.</p></div>');
}

type PaymentChargeEmail = {
  orderId: string;
  plate: string;
  productName: string;
  amountCents: number;
  method: 'pix' | 'boleto' | 'card' | 'link';
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  /** Valor antes do desconto, quando houver cupom. */
  subtotalCents?: number;
  /** Desconto já abatido, em centavos. */
  discountCents?: number;
  couponCode?: string;
};

/**
 * Envia a cobrança ao cliente logo depois de gerada.
 *
 * O e-mail é o mesmo endereço que vai para o provedor de pagamento, então ele
 * confirma ao cliente qual identidade está sendo usada na transação — evita a
 * dúvida de "qual e-mail está sendo cobrado" e dá o QR Code / o boleto fora do
 * navegador, caso ele feche a aba.
 */
export async function sendPaymentChargeEmail(email: string, charge: PaymentChargeEmail) {
  const valor = (charge.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pedido = charge.orderId.slice(-8).toUpperCase();
  const metodo = charge.method === 'pix' ? 'Pix' : charge.method === 'boleto' ? 'Boleto' : charge.method === 'link' ? 'Link de pagamento' : 'Cartão de crédito';
  const descontoTexto = charge.discountCents
    ? ` Cupom ${charge.couponCode || 'aplicado'}: -${(charge.discountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de desconto.`
    : '';

  let instrucao = '';
  let acao = '';
  if (charge.method === 'pix') {
    instrucao = 'Abra o app do seu banco, escolha pagar com Pix e escaneie o QR Code abaixo. O pedido é liberado assim que o pagamento é confirmado.';
    acao = `<p><a href="${charge.qrCode || '#'}" style="display:inline-block;padding:12px 20px;background:#18a976;color:#fff;border-radius:8px;text-decoration:none">Abrir QR Code do Pix</a></p>`
      + (charge.qrCodeBase64 ? `<p><img src="data:image/png;base64,${charge.qrCodeBase64}" alt="QR Code Pix" width="260" style="display:block;margin:18px 0"/></p>` : '');
  } else if (charge.method === 'boleto') {
    instrucao = 'Pague o boleto pelo link abaixo. O pedido é liberado assim que o pagamento é compensado.';
    acao = `<p><a href="${charge.ticketUrl || '#'}" style="display:inline-block;padding:12px 20px;background:#18a976;color:#fff;border-radius:8px;text-decoration:none">Abrir boleto</a></p>`;
  } else if (charge.method === 'link') {
    instrucao = 'Finalize o pagamento pelo link abaixo. O pedido é liberado assim que o pagamento é confirmado.';
    acao = `<p><a href="${charge.ticketUrl || '#'}" style="display:inline-block;padding:12px 20px;background:#18a976;color:#fff;border-radius:8px;text-decoration:none">Abrir página de pagamento</a></p>`;
  } else {
    instrucao = 'Registramos o pagamento com o cartão informado no checkout. O pedido é liberado assim que a aprovação é confirmada.';
  }

  const text = `Olá! Geramos sua cobrança de ${valor} (${metodo}) para a consulta ${charge.productName} — placa ${charge.plate}, pedido ${pedido}.${descontoTexto}\n\n${instrucao}\n\nEste e-mail foi enviado para ${email}, o mesmo endereço usado na cobrança.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#183b55;margin:0 0 6px">Sua cobrança está pronta</h2>
    <p style="color:#5a6d7a;margin:0 0 20px">Pedido <strong>${pedido}</strong> · ${charge.productName} · placa ${charge.plate}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      ${charge.subtotalCents != null && charge.discountCents ? `<tr><td style="padding:10px 0;color:#5a6d7a">Subtotal</td><td style="padding:10px 0;text-align:right">${(charge.subtotalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>` : ''}
      ${charge.discountCents ? `<tr><td style="padding:10px 0;color:#5a6d7a">Desconto${charge.couponCode ? ` (${charge.couponCode})` : ''}</td><td style="padding:10px 0;text-align:right">-${(charge.discountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>` : ''}
      <tr><td style="padding:10px 0;color:#5a6d7a">Valor</td><td style="padding:10px 0;text-align:right"><strong style="font-size:18px">${valor}</strong></td></tr>
      <tr><td style="padding:10px 0;color:#5a6d7a">Forma de pagamento</td><td style="padding:10px 0;text-align:right">${metodo}</td></tr>
      <tr><td style="padding:10px 0;color:#5a6d7a">E-mail da cobrança</td><td style="padding:10px 0;text-align:right">${email}</td></tr>
    </table>
    <p style="color:#334956;line-height:1.6">${instrucao}</p>
    ${acao}
    <p style="color:#82929c;font-size:12px;margin-top:24px;border-top:1px solid #e6ecef;padding-top:14px">Se você não reconhece esta cobrança, entre em contato com a gente.</p>
  </div>`;
  await sendEmail(email, `Sua cobrança de ${valor} está pronta | Olho no Doc`, text, html);
}
