import { appendFile, mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const LOG_DIR = process.env.APP_LOG_DIR || path.join(process.cwd(), 'logs');
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_FILES = 5;

type LogLevel = 'info' | 'warn' | 'error';

function timestamp() { return new Date().toISOString(); }

async function currentFile() {
  const files = (await safeReaddir()).filter(name => name.endsWith('.log')).sort();
  const latest = files[files.length - 1];
  if (latest) {
    const size = await fileSize(path.join(LOG_DIR, latest));
    if (size < MAX_BYTES) return path.join(LOG_DIR, latest);
  }
  return path.join(LOG_DIR, `app-${Date.now()}.log`);
}

async function safeReaddir() { try { return await readdir(LOG_DIR); } catch { return []; } }
async function fileSize(file: string) { try { return (await stat(file)).size; } catch { return 0; } }

export async function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  // As chaves reservadas não podem ser sobrescritas pelo payload: um `ts` vindo
  // do chamador (o header x-signature do webhook, por exemplo) tornava a linha
  // do log ilegível no painel.
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data || {})) {
    payload[key === 'ts' ? 'dataTs' : key === 'level' ? 'dataLevel' : key === 'event' ? 'dataEvent' : key] = value;
  }
  const entry = { ts: timestamp(), level, event, ...payload };
  const line = JSON.stringify(entry) + '\n';
  // Sempre no stdout: em produção o painel de logs lê o arquivo, mas o console
  // é o que fica disponível quando o container morre ou o proxy devolve 502.
  if (process.env.NODE_ENV !== 'production') console.log(`[${level}] ${event}`, data ? JSON.stringify(data) : '');
  else console.log(line.trim());
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const file = await currentFile();
    await appendFile(file, line, 'utf8');
    const files = (await safeReaddir()).filter(name => name.endsWith('.log')).sort();
    while (files.length > MAX_FILES) { const oldest = files.shift(); if (oldest) await unlink(path.join(LOG_DIR, oldest)).catch(() => undefined); }
  } catch { /* logging must never break the app */ }
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => log('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) => log('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) => log('error', event, data),
};

/**
 * Envolve um route handler para que toda requisição — com sucesso ou erro — deixe
 * rastro no painel de logs do admin, e para que a resposta seja sempre JSON
 * (um erro não tratado quebraria o cliente, que espera JSON).
 */
export function logRequest<T>(area: string, handler: (request: Request) => Promise<Response>): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const started = Date.now();
    const path = new URL(request.url).pathname;
    await log('info', 'http.request', { area, method: request.method, path });
    try {
      const response = await handler(request);
      await log(response.ok ? 'info' : 'warn', 'http.response', {
        area,
        method: request.method,
        path,
        status: response.status,
        durationMs: Date.now() - started,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro';
      const stack = error instanceof Error ? (error.stack || '').slice(0, 500) : '';
      await log('error', 'http.unhandled_error', { area, method: request.method, path, durationMs: Date.now() - started, message, stack });
      return new Response(JSON.stringify({ error: 'Erro interno no servidor. Tente novamente em instantes.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  };
}

export async function readLogs(limit = 200) {
  try {
    if (!existsSync(LOG_DIR)) return [];
    const files = (await readdir(LOG_DIR)).filter(name => name.endsWith('.log')).sort().reverse();
    const entries: Array<{ ts: string; level: string; event: string; [key: string]: unknown }> = [];
    for (const file of files) {
      if (entries.length >= limit) break;
      const content = await import('node:fs/promises').then(fs => fs.readFile(path.join(LOG_DIR, file), 'utf8')).catch(() => '');
      for (const line of content.split('\n').reverse()) {
        if (entries.length >= limit) break;
        if (!line.trim()) continue;
        try { entries.push(JSON.parse(line)); } catch { entries.push({ ts: '', level: 'info', event: line }); }
      }
    }
    return entries.reverse();
  } catch { return []; }
}
