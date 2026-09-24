import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword, normalizeCpf, normalizeEmail, normalizePhone } from '@/lib/auth';

function validCpf(cpf: string) { return /^\d{11}$/.test(cpf) && !/^([0-9])\1{10}$/.test(cpf); }
function validPhone(phone: string) { return /^\d{10,13}$/.test(phone); }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const phone = typeof body?.phone === 'string' ? normalizePhone(body.phone) : '';
  const cpf = typeof body?.cpf === 'string' ? normalizeCpf(body.cpf) : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (name.length < 2) return NextResponse.json({ error: 'Informe seu nome completo.' }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: 'Informe um WhatsApp válido com DDD.' }, { status: 400 });
  if (!validCpf(cpf)) return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
  const [existingUser, existingCustomer] = await Promise.all([prisma.user.findUnique({ where: { email }, select: { id: true } }), prisma.customer.findFirst({ where: { OR: [{ email }, { cpf }] }, select: { email: true, cpf: true } })]);
  if (existingUser || existingCustomer?.email === email) return NextResponse.json({ error: 'Este e-mail já está cadastrado. Escolha “Já tenho cadastro”.' }, { status: 409 });
  if (existingCustomer?.cpf === cpf) return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { name, email, passwordHash: await hashPassword(password), role: 'CUSTOMER' } });
    await tx.customer.create({ data: { userId: created.id, name, email, phone, cpf } });
    return created;
  });
  await createSession(user.id);
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}
