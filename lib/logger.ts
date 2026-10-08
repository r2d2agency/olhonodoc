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
  const entry = { ts: timestamp(), level, event, ...(data || {}) };
  const line = JSON.stringify(entry) + '\n';
  if (process.env.NODE_ENV !== 'production') console.log(`[${level}] ${event}`, data ? JSON.stringify(data) : '');
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
