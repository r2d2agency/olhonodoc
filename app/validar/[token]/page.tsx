'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

type Validation = {
  valid: boolean; error?: string; placa?: string; realizadaEm?: string;
  status?: string; produto?: string; codigoConsulta?: string; pdfHash?: string | null; origem?: string;
};

export default function ValidatePage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<Validation | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/public/validate/${encodeURIComponent(params.token)}`)
      .then(r => r.json()).then(setData).catch(() => setData({ valid: false, error: 'Falha de rede.' }))
      .finally(() => setLoading(false));
  }, [params.token]);

  return <main className="auth-page"><div className="auth-box">
    <Link href="/" className="brand" style={{ display: 'inline-block', marginBottom: 20 }}><img src="/logo-olho-no-doc.png" alt="Olho no Doc" style={{ height: 40, width: 'auto' }} /></Link>
    <span className="eyebrow">Validação de consulta</span>
    <h1>{loading ? 'Validando…' : data?.valid ? 'Consulta original e validada' : 'Consulta não validada'}</h1>
    <p>{loading ? 'Aguarde enquanto verificamos a autenticidade.' : data?.valid ? 'Esta consulta foi emitida e validada pela Olho no Doc.' : (data?.error || 'Não foi possível validar esta consulta.')}</p>
    {data?.valid && <div className="report-grid" style={{ marginTop: 24 }}>
      <div className="report-row"><span>Placa</span><strong>{data.placa}</strong></div>
      <div className="report-row"><span>Consulta</span><strong>{data.produto}</strong></div>
      <div className="report-row"><span>Realizada em</span><strong>{data.realizadaEm ? new Date(data.realizadaEm).toLocaleString('pt-BR') : '-'}</strong></div>
      <div className="report-row"><span>Número da consulta</span><strong>{data.codigoConsulta || '-'}</strong></div>
      <div className="report-row"><span>Origem</span><strong>{data.origem}</strong></div>
    </div>}
    <div style={{ textAlign: 'center', marginTop: 24, color: data?.valid ? 'var(--green)' : 'var(--muted)' }}>
      {loading ? <ShieldCheck size={32} /> : data?.valid ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
    </div>
  </div></main>;
}
