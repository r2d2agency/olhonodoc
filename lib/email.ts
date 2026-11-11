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

const BRAND = { name: 'Olho no Doc', logo: '/logo-olho-no-doc.png', primary: '#061b2f', accent: '#18c887', muted: '#5a6d7a', text: '#334956' };

function absoluteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').replace(/\/+$/, '');
  return base ? `${base}${path}` : path;
}

function emailLayout(opts: { title: string; subtitle?: string; accent: string; body: string; cta?: { label: string; url: string } }) {
  const logo = absoluteUrl(BRAND.logo);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:${BRAND.text}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(6,27,47,.08)">
        <tr><td style="background:${BRAND.primary};padding:20px 28px;text-align:left">
          <img src="${logo}" alt="${BRAND.name}" height="40" style="display:block;height:40px;width:auto;border:0" />
        </td></tr>
        <tr><td style="padding:28px 28px 8px">
          <h1 style="margin:0 0 4px;font-size:20px;color:${BRAND.primary};font-weight:800">${opts.title}</h1>
          ${opts.subtitle ? `<p style="margin:0 0 18px;color:${BRAND.muted};font-size:13px">${opts.subtitle}</p>` : ''}
          <div style="height:3px;width:48px;background:${opts.accent};border-radius:2px;margin-bottom:18px"></div>
          ${opts.body}
          ${opts.cta ? `<div style="margin:24px 0 8px"><a href="${opts.cta.url}" style="display:inline-block;padding:13px 24px;background:${opts.accent};color:#fff;border-radius:8px;text-decoration:none;font-weight:800;font-size:14px">${opts.cta.label}</a></div>` : ''}
        </td></tr>
        <tr><td style="padding:18px 28px 24px;border-top:1px solid #e6ecef">
          <p style="margin:0;color:#82929c;font-size:11px;line-height:1.6">
            ${BRAND.name} · Sua tranquilidade é nosso foco.<br>
            Este e-mail foi enviado porque você realizou uma consulta em nossa plataforma.<br>
            Em caso de dúvidas, responda a este e-mail.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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

export async function sendQueryProcessing(email: string, name: string, plate: string, productName: string) {
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente';
  const text = `Olá, ${firstName}! Recebemos seu pedido da ${productName} — placa ${plate}. Sua consulta está sendo processada e você será informado por e-mail quando ela for concluída. O processamento automático leva até 15 minutos.`;
  const body = `<p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Olá, <strong>${firstName}</strong>!</p>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Sua consulta está sendo processada e <strong>você será informado por e-mail quando ela for concluída</strong>.</p>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">O processamento automático leva até 15 minutos. Se passar desse tempo, é porque encontramos alguma informação que precisa ser analisada pela nossa Mesa de Análise Técnica — nesse caso avisaremos você também.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e6ecef;border-radius:8px;overflow:hidden">
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px">Produto</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary}">${productName}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Placa</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary};border-top:1px solid #e6ecef">${plate}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Status</td><td style="padding:12px 16px;text-align:right;border-top:1px solid #e6ecef"><span style="display:inline-block;padding:4px 10px;background:#e7f0fd;color:#2f5fb3;border-radius:20px;font-size:11px;font-weight:800">Processando</span></td></tr>
    </table>`;
  const html = emailLayout({ title: 'Processando sua consulta', subtitle: `${productName} · placa ${plate}`, accent: '#2f5fb3', body });
  await sendEmail(email, 'Processando sua consulta | Olho no Doc', text, html);
}

export async function sendQueryInAnalysis(email: string, name: string, plate: string, productName: string) {
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente';
  const text = `Olá, ${firstName}! Sua consulta ${productName} — placa ${plate} foi encaminhada para a Mesa de Análise Técnica. Nossa equipe especializada está avaliando inconsistências e casos que exigem atenção (por exemplo, indícios de sinistro ou leilão). Avisaremos por e-mail assim que o relatório estiver pronto.`;
  const body = `<p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Olá, <strong>${firstName}</strong>!</p>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Sua consulta foi encaminhada para a <strong>Mesa de Análise Técnica</strong>. Nossa equipe especializada está avaliando inconsistências e casos que exigem atenção (por exemplo, indícios de sinistro ou leilão).</p>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Avisaremos por e-mail assim que o relatório estiver pronto.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e6ecef;border-radius:8px;overflow:hidden">
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px">Produto</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary}">${productName}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Placa</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary};border-top:1px solid #e6ecef">${plate}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Status</td><td style="padding:12px 16px;text-align:right;border-top:1px solid #e6ecef"><span style="display:inline-block;padding:4px 10px;background:#fff3d6;color:#9b7739;border-radius:20px;font-size:11px;font-weight:800">Em análise técnica</span></td></tr>
    </table>`;
  const html = emailLayout({ title: 'Sua consulta está em análise técnica', subtitle: `${productName} · placa ${plate}`, accent: '#9b7739', body });
  await sendEmail(email, 'Sua consulta está em análise técnica | Olho no Doc', text, html);
}

export async function sendQueryCompleted(email: string, name: string, plate: string, productName: string, reportUrl: string) {
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente';
  const text = `Olá, ${firstName}! Sua consulta ${productName} — placa ${plate} foi concluída. Veja o relatório em ${reportUrl}`;
  const body = `<p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">Olá, <strong>${firstName}</strong>!</p>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 12px">O relatório da sua consulta está pronto e disponível na sua área.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e6ecef;border-radius:8px;overflow:hidden">
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px">Produto</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary}">${productName}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Placa</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:${BRAND.primary};border-top:1px solid #e6ecef">${plate}</td></tr>
      <tr><td style="padding:12px 16px;color:${BRAND.muted};font-size:12px;border-top:1px solid #e6ecef">Status</td><td style="padding:12px 16px;text-align:right;border-top:1px solid #e6ecef"><span style="display:inline-block;padding:4px 10px;background:#e8f8f1;color:#10815a;border-radius:20px;font-size:11px;font-weight:800">Concluída</span></td></tr>
    </table>
    <p style="color:${BRAND.text};line-height:1.6;margin:0 0 8px">Você pode visualizar e baixar o laudo diretamente na plataforma.</p>`;
  const html = emailLayout({ title: 'Sua consulta foi concluída', subtitle: `${productName} · placa ${plate}`, accent: '#10815a', body, cta: { label: 'Ver relatório', url: reportUrl } });
  await sendEmail(email, 'Sua consulta foi concluída | Olho no Doc', text, html);
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
  subtotalCents?: number;
  discountCents?: number;
  couponCode?: string;
};

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
