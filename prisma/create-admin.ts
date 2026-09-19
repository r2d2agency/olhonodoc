import { PrismaClient, UserRole } from '@prisma/client';
import { promisify } from 'node:util';
import { randomBytes, scrypt } from 'node:crypto';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Superadmin';

  if (!email || !email.includes('@')) throw new Error('Defina ADMIN_EMAIL com um e-mail válido.');
  if (!password || password.length < 12) throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: await hashPassword(password), role: UserRole.SUPERADMIN },
    create: { email, name, passwordHash: await hashPassword(password), role: UserRole.SUPERADMIN }
  });

  console.log(`Superadmin configurado: ${user.email} (${user.id})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());