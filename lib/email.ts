import nodemailer from 'nodemailer';

export async function sendLoginCode(email: string, code: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[auth] Código demonstrativo para ${email}: ${code}`);
      return;
    }
    throw new Error('SMTP não configurado.');
  }
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
  await transport.sendMail({ from: EMAIL_FROM, to: email, subject: 'Seu código de acesso | Olho no Doc', text: `Seu código de acesso é ${code}. Ele expira em 10 minutos.`, html: `<div style="font-family:Arial,sans-serif"><h2>Olho no Doc</h2><p>Use este código para acessar sua conta:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>O código expira em 10 minutos.</p></div>` });
}