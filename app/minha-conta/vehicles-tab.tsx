'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CarFront, ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { AccountQuery } from './portal';

type Vehicle = {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuel: string;
  uf: string;
  city: string;
  chassis: string;
  consultas: AccountQuery[];
  lastAt: string;
};

function aggValue(report: Record<string, any> | null | undefined, key: string) {
  if (!report) return '';
  const agg = report.agregados || report.bin || report.estadual || {};
  return String(agg[key] ?? agg[key.charAt(0).toUpperCase() + key.slice(1)] ?? '');
}

export default function VehiclesTab({ queries, onNewQuery }: { queries: AccountQuery[]; onNewQuery: () => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const vehicles = useMemo<Vehicle[]>(() => {
    const map = new Map<string, Vehicle>();
    for (const q of queries) {
      const plate = (q.plate || q.query?.normalizedPlate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (!plate) continue;
      const existing = map.get(plate);
      const ag = q.query?.report;
      const item = {
        plate,
        brand: aggValue(ag, 'marca'),
        model: aggValue(ag, 'modelo'),
        year: aggValue(ag, 'anoModelo') || aggValue(ag, 'anoFabricacao'),
        color: aggValue(ag, 'cor'),
        fuel: aggValue(ag, 'combustivel'),
        uf: aggValue(ag, 'Uf') || aggValue(ag, 'uf'),
        city: aggValue(ag, 'municipio'),
        chassis: aggValue(ag, 'chassi'),
      };
      if (existing) {
        existing.consultas.push(q);
        if (new Date(q.createdAt) > new Date(existing.lastAt)) {
          existing.lastAt = q.createdAt;
          Object.assign(existing, item, { consultas: existing.consultas });
        }
      } else {
        map.set(plate, { ...item, consultas: [q], lastAt: q.createdAt });
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [queries]);

  const filtered = vehicles.filter(v => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [v.plate, v.brand, v.model, v.year, v.uf, v.city].some(s => s.toLowerCase().includes(term));
  });

  if (vehicles.length === 0) return <section className="customer-tab-content">
    <span className="customer-eyebrow">GARAGEM</span><h1>Meus veículos</h1>
    <div className="customer-empty-card"><CarFront size={24} /><div><h3>Sua garagem está vazia</h3><p>Informe uma placa e faça uma consulta para ver o veículo aqui.</p></div><button onClick={onNewQuery}>Consultar placa <ArrowRight size={16} /></button></div>
  </section>;

  return <section className="customer-tab-content">
    <span className="customer-eyebrow">GARAGEM</span>
    <h1>Meus veículos</h1>
    <p>Veículos das suas consultas realizadas, com os dados básicos retornados pela base.</p>
    <div className="customer-vehicle-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placa, marca, modelo, cidade ou UF" aria-label="Buscar veículo" /></div>
    <p style={{ margin: '12px 0', color: '#7a8a93', fontSize: '.78rem' }}>{filtered.length} veículo(s) encontrado(s)</p>
    <div className="customer-vehicle-grid">
      {filtered.map(v => <article key={v.plate} className="customer-vehicle-card-item">
        <div className="customer-vehicle-card-top">
          <span className="customer-vehicle-icon"><CarFront size={22} /></span>
          <div><span className="customer-eyebrow">PLACA</span><h3>{v.plate}</h3><small>{[v.uf, v.city].filter(Boolean).join(' · ')}</small></div>
          <button type="button" className="customer-vehicle-toggle" onClick={() => setOpen(open === v.plate ? null : v.plate)} aria-label="Ver detalhes">
            {open === v.plate ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <div className="customer-vehicle-info">
          <div><small>MARCA/MODELO</small><strong>{[v.brand, v.model].filter(Boolean).join(' / ') || 'Não informado'}</strong></div>
          <div><small>ANO</small><strong>{v.year || '—'}</strong></div>
          <div><small>COR</small><strong>{v.color || '—'}</strong></div>
          <div><small>COMBUSTÍVEL</small><strong>{v.fuel || '—'}</strong></div>
        </div>
        {open === v.plate && <div className="customer-vehicle-details">
          <p><small>CHASSI</small><strong style={{ overflowWrap: 'anywhere' }}>{v.chassis || '—'}</strong></p>
          <p><small>CONSULTAS DESTA PLACA</small><strong>{v.consultas.length}</strong></p>
          <div className="customer-vehicle-queries">
            {v.consultas.map(q => <div key={q.id}><span>{q.product.name}</span><small>{new Date(q.createdAt).toLocaleString('pt-BR')}</small><span className={`customer-query-status ${(q.query?.companyStatus || q.status).toLowerCase()}`}>{q.query?.companyStatus || q.status}</span></div>)}
          </div>
        </div>}
      </article>)}
    </div>
  </section>;
}
