import nodemailer from 'nodemailer';
import { getSmtpConfiguration } from '@/lib/smtp-settings';

async function sendEmail(email: string, subject: string, text: string, html: string) {
  const settings = await getSmtpConfiguration();
  if (!settings) {
    if (process.env.NODE_ENV !== 'production') return;
    throw new Error('SMTP não configurado.');
  }
  const transport = nodemailer.createTransport({ host: settings.host, port: settings.port, secure: settings.secure, auth: { user: settings.user, pass: settings.password } });
  await transport.sendMail({ from: settings.from, to: email, subject, text, html });
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
