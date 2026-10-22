'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

type LogEntry = { ts: string; level: string; event: string; [key: string]: unknown };

const LEVELS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'error', label: 'Erros' },
  { value: 'warn', label: 'Avisos' },
  { value: 'info', label: 'Info' },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [level, setLevel] = useState('ALL');

  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/logs?limit=500');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível carregar os logs.');
      setLogs(body.data || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar logs'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const byLevel = level === 'ALL' ? logs : logs.filter(entry => entry.level === level);
  const filtered = filter ? byLevel.filter(entry => JSON.stringify(entry).toLowerCase().includes(filter.toLowerCase())) : byLevel;
  const errorCount = logs.filter(entry => entry.level === 'error').length;

  return (
    <main className="admin-cms">
      <header className="admin-cms-header">
        <div>
          <span className="admin-cms-kicker">SISTEMA / DIAGNÓSTICO</span>
          <h1>Logs do sistema</h1>
          <p>Tudo que a aplicação registrou: requisições, acertos e erros, com contexto para diagnóstico.</p>
        </div>
        <button className="admin-cms-primary" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Atualizar
        </button>
      </header>

      {error && <div className="admin-cms-message error">{error}</div>}

      <section className="admin-order-summary">
        <span>Eventos: <strong>{logs.length}</strong></span>
        <span>Erros: <strong>{errorCount}</strong></span>
        <span>Exibindo: <strong>{filtered.length}</strong></span>
      </section>

      <section className="admin-cms-card admin-payment-filters">
        <label>Nível
          <select value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>Buscar
          <input
            className="admin-input"
            placeholder="ex.: offline-payment, webhook, MP_ERROR"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </label>
      </section>

      <div className="admin-order-table">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>Nível</th><th>Evento</th><th>Detalhes</th></tr>
          </thead>
          <tbody>
            {!loading && filtered.map((entry, index) => (
              <tr key={index}>
                <td><small>{entry.ts ? new Date(entry.ts).toLocaleString('pt-BR') : '—'}</small></td>
                <td><span className={`admin-order-status ${entry.level === 'error' ? 'cancelled' : entry.level === 'warn' ? 'pending' : 'completed'}`}>{entry.level}</span></td>
                <td><strong>{entry.event}</strong></td>
                <td><code>{JSON.stringify(Object.fromEntries(Object.entries(entry).filter(([key]) => !['ts', 'level', 'event'].includes(key))))}</code></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={4}>Nenhum log encontrado.</td></tr>}
            {loading && <tr><td colSpan={4}>Carregando logs…</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
