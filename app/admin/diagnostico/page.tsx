'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, RefreshCw, XCircle } from 'lucide-react';

type Check = { name: string; ok: boolean; detail: string };

export default function AdminDiagnosticsPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/diagnostics', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível rodar o diagnóstico.');
      setChecks(body.data.checks || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível rodar o diagnóstico.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const failed = checks.filter(check => !check.ok).length;

  return (
    <main className="admin-cms">
      <header className="admin-cms-header">
        <div>
          <span className="admin-cms-kicker">SISTEMA / DIAGNÓSTICO</span>
          <h1>Diagnóstico do ambiente</h1>
          <p>Confere, em um só lugar, o que impede os pagamentos de funcionarem: banco, schema, credenciais e rede até o provedor.</p>
        </div>
        <div className="admin-cms-actions">
          <button className="admin-cms-primary" onClick={() => void load()} disabled={loading}>
            {loading ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />} Verificar agora
          </button>
        </div>
      </header>

      {error && <div className="admin-cms-message error">{error}</div>}
      {!loading && checks.length > 0 && (
        <div className={`admin-cms-message ${failed ? 'error' : ''}`}>
          {failed ? `${failed} verificação(ões) com problema.` : 'Tudo certo: nenhuma falha encontrada.'}
        </div>
      )}

      <div className="admin-order-table">
        <table>
          <thead>
            <tr><th>Verificação</th><th>Situação</th><th>Detalhe</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={3}>Executando verificações…</td></tr>}
            {!loading && checks.map(check => (
              <tr key={check.name}>
                <td><strong>{check.name}</strong></td>
                <td>
                  <span className={`admin-order-status ${check.ok ? 'completed' : 'cancelled'}`}>
                    {check.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {check.ok ? 'OK' : 'Problema'}
                  </span>
                </td>
                <td><small>{check.detail}</small></td>
              </tr>
            ))}
            {!loading && !checks.length && <tr><td colSpan={3}>Nenhuma verificação retornou.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
