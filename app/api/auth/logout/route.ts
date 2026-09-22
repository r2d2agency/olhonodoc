import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashValue } from '@/lib/auth';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('olhonodoc_session')?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashValue(token) } });
  cookieStore.set('olhonodoc_session', '', { httpOnly: true, expires: new Date(0), path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return NextResponse.json({ ok: true });
}
