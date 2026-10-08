import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { readLogs } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const limit = Number(new URL(request.url).searchParams.get('limit') || 200);
  const logs = await readLogs(Math.min(Math.max(limit, 1), 1000));
  return NextResponse.json({ data: logs });
}
