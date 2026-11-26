'use client';

import { useMemo } from 'react';
import { ArrowRight, CarFront, Clock3, FileText } from 'lucide-react';
import type { AccountQuery } from './portal';

type Props = {
  queries: AccountQuery[];
  loading: boolean;
  onSelectPlate: (plate: string) => void;
};

function textFrom(report: unknown, key: string) {
  const rec = report as Record<string, any> | null | undefined;
  const src = rec?.agregados || rec?.bin || rec?.estadual || {};
  return String(src[key] ?? src[key.charAt(0).toUpperCase() + key.slice(1)] ?? '').trim();
}

export default function AccountOverview({ queries, loading, onSelectPlate }: Props) {
  const vehicles = useMemo(() => {
    const map = new Map<string, { plate: string; brand: string; model: string; year: string; color: string; lastAt: string; count: number }>();
    for (const item of queries) {
      const plate = (item.plate || item.query?.normalizedPlate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (!plate) continue;
      const report = item.query?.report;
      const current = map.get(plate);
      const data = {
        plate,
        brand: textFrom(report, 'marca'),
        model: textFrom(report, 'modelo'),
        year: textFrom(report, 'anoModelo') || textFrom(report, 'anoFabricacao'),
        color: textFrom(report, 'cor'),
        lastAt: item.createdAt,
        count: 1,
      };
      if (current) {
        current.count += 1;
        if (new Date(item.createdAt) > new Date(current.lastAt)) Object.assign(current, data, { count: current.count });
      } else map.set(plate, data);
    }
    return [...map.values()].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [queries]);

  return <>
    <section className="customer-tab-content customer-overview-section">
      <span className="customer-eyebrow">SUA GARAGEM</span>
      <h2>Meus veículos</h2>
      <p>Placas já consultadas na sua conta. Selecione uma para comprar outra consulta.</p>
      {loading ? <div className="customer-empty-card"><Clock3 size={20} /> Carregando seus veículos…</div>
        : vehicles.length === 0 ? <div className="customer-empty-card"><CarFront size={22} /><div><h3>Sua garagem está vazia</h3><p>Consulte uma placa para ver o veículo aqui.</p></div></div>
        : <div className="customer-overview-vehicles">{vehicles.map(v => <article key={v.plate} className="customer-overview-vehicle">
          <div className="customer-vehicle-icon"><CarFront size={20} /></div>
          <div><strong>{v.plate}</strong><small>{[v.brand, v.model].filter(Boolean).join(' / ') || 'Dados básicos disponíveis'}</small><span>{[v.year, v.color].filter(Boolean).join(' · ')}</span></div>
          <button type="button" onClick={() => onSelectPlate(v.plate)}>Consultar <ArrowRight size={14} /></button>
        </article>)}</div>}
    </section>

    <section className="customer-tab-content customer-overview-section">
      <span className="customer-eyebrow">HISTÓRICO RECENTE</span>
      <h2>Últimas consultas</h2>
      <p>Acompanhe o andamento e baixe os relatórios disponíveis.</p>
      {loading ? <div className="customer-empty-card"><Clock3 size={20} /> Carregando consultas…</div>
        : queries.length === 0 ? <div className="customer-empty-card"><FileText size={22} /><div><h3>Nenhuma consulta ainda</h3><p>Quando você fizer uma consulta, ela aparecerá aqui.</p></div></div>
        : <div className="customer-overview-queries">{queries.slice(0, 5).map(q => <article key={q.id} className="customer-overview-query">
          <div><strong>{q.plate}</strong><small>{q.product.name} · {new Date(q.createdAt).toLocaleDateString('pt-BR')}</small></div>
          <span className={`customer-query-status ${(q.query?.companyStatus || q.status).toLowerCase()}`}>{q.query?.companyStatus || q.status}</span>
          <button type="button" onClick={() => onSelectPlate((q.plate || q.query?.normalizedPlate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}>Nova consulta <ArrowRight size={14} /></button>
        </article>)}</div>}
    </section>
  </>;
}
