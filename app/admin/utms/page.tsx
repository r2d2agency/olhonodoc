'use client';

import { useState } from 'react';
import { ArrowUpRight, Copy, Link2 } from 'lucide-react';

const fields = [
  { key: 'targetUrl', label: 'Página de destino', placeholder: 'https://seudominio.com.br/consultas', required: true, wide: true },
  { key: 'source', label: 'Origem · utm_source', placeholder: 'google, instagram, newsletter' },
  { key: 'medium', label: 'Mídia · utm_medium', placeholder: 'cpc, social, email' },
  { key: 'campaign', label: 'Campanha · utm_campaign', placeholder: 'nome-da-campanha' },
  { key: 'content', label: 'Conteúdo · utm_content', placeholder: 'criativo-a, banner-topo' },
  { key: 'term', label: 'Termo · utm_term', placeholder: 'consulta veicular' },
] as const;

type Form = { targetUrl: string; source: string; medium: string; campaign: string; content: string; term: string };
const empty: Form = { targetUrl: '', source: '', medium: '', campaign: '', content: '', term: '' };

export default function UtmPage() {
  const [form, setForm] = useState<Form>(empty);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(event: React.FormEvent) {
    event.preventDefault();
    setMessage(''); setResult(''); setCopied(false);
    try {
      const url = new URL(form.targetUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      const values: [string, string][] = [['utm_source', form.source], ['utm_medium', form.medium], ['utm_campaign', form.campaign], ['utm_content', form.content], ['utm_term', form.term]];
      values.forEach(([key, value]) => { if (value.trim()) url.searchParams.set(key, value.trim()); });
      setResult(url.toString());
    } catch { setMessage('Informe uma URL completa e válida, começando por https://'); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(result); setCopied(true); } catch { setMessage('Não foi possível copiar automaticamente. Selecione e copie o link.'); }
  }

  return (
    <main className="admin-cms">
      <header className="admin-cms-header"><div><span className="admin-cms-kicker">MARKETING / ATRIBUIÇÃO</span><h1>Gerador de UTMs</h1><p>Monte links rastreáveis para identificar origem, campanha e criativo das visitas.</p></div></header>
      {message && <div className="admin-cms-message error" role="alert">{message}</div>}
      <section className="admin-cms-card">
        <div className="admin-cms-card-heading"><div><h2>Parâmetros da campanha</h2><p>Preencha os campos que se aplicam. A URL mantém parâmetros existentes.</p></div><span className="admin-cms-card-badge"><Link2 size={13}/> GERADOR</span></div>
        <form className="admin-utm-form" onSubmit={generate}>
          {fields.map((field) => <label key={field.key} className={field.wide ? 'wide' : ''}>{field.label}{field.required && <span aria-hidden="true"> *</span>}<input required={field.required} type={field.key === 'targetUrl' ? 'url' : 'text'} placeholder={field.placeholder} value={form[field.key]} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}/></label>)}
          <div className="wide"><button className="admin-cms-primary" type="submit">Gerar link <ArrowUpRight size={15}/></button></div>
        </form>
        {result && <div className="admin-utm-result"><div><strong>Link pronto para usar</strong><code>{result}</code></div><button className="admin-secondary-button" type="button" onClick={copy}><Copy size={14}/>{copied ? 'Copiado' : 'Copiar link'}</button></div>}
      </section>
    </main>
  );
}
