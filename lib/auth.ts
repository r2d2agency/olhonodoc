import { createHash, randomBytes, randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const CODE_TTL_MINUTES = 10;
const SESSION_TTL_DAYS = 30;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashValue = (value: string) => createHash('sha256').update(value).digest('hex');
export const newCode = () => randomInt(100000, 1000000).toString();

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashValue(token), expiresAt } });
  cookies().set('olhonodoc_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: expiresAt, path: '/' });
}

export async function getCurrentUser() {
  const token = cookies().get('olhonodoc_session')?.value;
  if (!token) return null;
  const session = await prisma.session.findFirst({ where: { tokenHash: hashValue(token), expiresAt: { gt: new Date() } }, include: { user: true } });
  return session?.user ?? null;
}

export async function requireSuperadmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPERADMIN') return null;
  return user;
}