import { createDecipheriv, createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const SETTING_KEY = 'email.smtp';
const encryptionKey = () => {
  const secret = process.env.SMTP_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) throw new Error('SMTP_ENCRYPTION_KEY deve conter ao menos 32 caracteres.');
  return scryptSync(secret, 'olhonodoc-smtp-v1', 32);
};

export function encryptSmtpPassword(password: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptSmtpPassword(value: string) {
  const [ivText, tagText, encryptedText] = value.split('.');
  if (!ivText || !tagText || !encryptedText) throw new Error('Credencial SMTP inválida.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]).toString('utf8');
}

export type SmtpConfiguration = { host: string; port: number; user: string; from: string; secure: boolean; password: string };
export type PublicSmtpConfiguration = Omit<SmtpConfiguration, 'password'> & { passwordConfigured: boolean };

export async function getSmtpConfiguration(): Promise<SmtpConfiguration | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (row) {
      const saved = row.value as Record<string, unknown>;
      const host = typeof saved.host === 'string' ? saved.host : '';
      const user = typeof saved.user === 'string' ? saved.user : '';
      const from = typeof saved.from === 'string' ? saved.from : '';
      const passwordEncrypted = typeof saved.passwordEncrypted === 'string' ? saved.passwordEncrypted : '';
      const port = Number(saved.port);
      if (!host || !user || !from || !passwordEncrypted || !Number.isInteger(port)) return null;
      return { host, port, user, from, secure: saved.secure === true, password: decryptSmtpPassword(passwordEncrypted) };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) return null;
  const port = Number(SMTP_PORT || 587);
  return { host: SMTP_HOST, port, user: SMTP_USER, from: EMAIL_FROM, secure: port === 465, password: SMTP_PASSWORD };
}

function getEnvironmentSmtpConfiguration(): PublicSmtpConfiguration {
  const port = Number(process.env.SMTP_PORT || 587);
  return { host: process.env.SMTP_HOST || '', port: Number.isInteger(port) ? port : 587, user: process.env.SMTP_USER || '', from: process.env.EMAIL_FROM || '', secure: port === 465, passwordConfigured: Boolean(process.env.SMTP_PASSWORD) };
}

export async function getPublicSmtpConfiguration(): Promise<PublicSmtpConfiguration> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (row) {
      const saved = row.value as Record<string, unknown>;
      return { host: typeof saved.host === 'string' ? saved.host : '', port: Number(saved.port) || 587, user: typeof saved.user === 'string' ? saved.user : '', from: typeof saved.from === 'string' ? saved.from : '', secure: saved.secure === true, passwordConfigured: typeof saved.passwordEncrypted === 'string' && Boolean(saved.passwordEncrypted) };
    }
  } catch (error) {
    console.error('[smtp-settings] falha ao consultar configuração persistida; usando variáveis de ambiente', error instanceof Error ? error.message : error);
  }
  return getEnvironmentSmtpConfiguration();
}

export async function saveSmtpConfiguration(input: { host: string; port: number; user: string; from: string; secure: boolean; password?: string }) {
  const previous = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  const priorData = previous?.value as Record<string, unknown> | undefined;
  const current = await getSmtpConfiguration().catch(() => null);
  const passwordEncrypted = input.password ? encryptSmtpPassword(input.password) : (priorData?.passwordEncrypted as string | undefined);
  if (!passwordEncrypted && !current?.password) throw new Error('Informe a senha SMTP.');
  const value = { host: input.host, port: input.port, user: input.user, from: input.from, secure: input.secure, passwordEncrypted: passwordEncrypted || encryptSmtpPassword(current!.password) };
  await prisma.setting.upsert({ where: { key: SETTING_KEY }, create: { key: SETTING_KEY, value }, update: { value } });
}
