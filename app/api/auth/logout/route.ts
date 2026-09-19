import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashValue } from '@/lib/auth';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('olhonodoc_session')?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashValue(token) } });
  cookieStore.delete('olhonodoc_session');
  return NextResponse.json({ message: 'Sessão encerrada.' });
}