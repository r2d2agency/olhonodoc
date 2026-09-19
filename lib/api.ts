import { NextResponse } from 'next/server';

export async function readJson<T = Record<string, unknown>>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}

export function serverError() {
  return NextResponse.json({ error: 'Não foi possível concluir a operação agora.' }, { status: 500 });
}
