'use client';

import { useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type Item = { id: string; slug: string; name: string; shortName: string; features: string[] };

export default function ProductFeaturesAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/product-features').then(async r => {
      const b = await readJson(r);
      if (!r.ok) throw new Error(b.error || 'Não foi possível carregar.');
      setItems(b.data);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setError(''); setMessage('');
    try {
      const r = await fetch('/api/admin/product-features', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
      const b = await readJson(r);
      if (!r.ok) throw new Error(b.error || 'Não foi possível salvar.');
      setMessage('Características atualizadas nos cards e na conta.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setSaving(false); }
  }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">PRODUTOS / CARACTERÍSTICAS</span><h1>Características das consultas</h1><p>Edite os itens exibidos nos cards da home e na área do cliente.</p></div></header>
    {error && <div className="admin-cms-message error">{error}</div>}
    {message && <div className="admin-cms-message">{message}</div>}
    {loading ? <div className="admin-cms-card"><p>Carregando…</p></div> : <section className="admin-cms-card">
      {items.map((item, index) => <div className="admin-product-features-row" key={item.id}>
        <h2>{item.name}</h2><small>{item.slug}</small>
        {item.features.map((feature, featureIndex) => <div className="admin-product-feature-input" key={featureIndex}>
          <span>{featureIndex + 1}</span>
          <input value={feature} maxLength={120} onChange={e => setItems(items.map((it, i) => i !== index ? it : { ...it, features: it.features.map((f, j) => j === featureIndex ? e.target.value : f) }))}/>
          <button type="button" onClick={() => setItems(items.map((it, i) => i !== index ? it : { ...it, features: it.features.filter((_, j) => j !== featureIndex) }))}>Remover</button>
        </div>)}
        <button type="button" className="admin-secondary-button" onClick={() => setItems(items.map((it, i) => i !== index ? it : { ...it, features: [...it.features, 'Nova característica'] }))}>+ Adicionar característica</button>
      </div>)}
      <div className="admin-cms-actions"><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : <><Save size={15}/> Salvar características</>}</button></div>
    </section>}
  </main>;
}
