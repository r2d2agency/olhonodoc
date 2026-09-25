import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShoppingBag, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { AdminPageHeader, KpiCard, StatusBadge } from '@/components/admin-primitives';

export const dynamic = 'force-dynamic';

function brl(cents: number) { return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function dayLabel(date: Date) { return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''); }

export default async function AdminPage() {
  const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
  const [orders, customers, queries, products] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: since } }, include: { product: { select: { name: true } }, customer: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.customer.count(),
    prisma.vehicleQuery.count({ where: { queriedAt: { gte: since } } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
  ]);
  const paid = orders.filter((order) => order.status === 'PAID' || order.status === 'COMPLETED');
  const revenue = paid.reduce((sum, order) => sum + (order.totalCents ?? order.amountCents), 0);
  const max = Math.max(1, ...Array.from({ length: 7 }, (_, index) => { const date = new Date(since); date.setDate(since.getDate() + index); return paid.filter((order) => order.createdAt.toDateString() === date.toDateString()).reduce((sum, order) => sum + (order.totalCents ?? order.amountCents), 0); }));
  const chart = Array.from({ length: 7 }, (_, index) => { const date = new Date(since); date.setDate(since.getDate() + index); const value = paid.filter((order) => order.createdAt.toDateString() === date.toDateString()).reduce((sum, order) => sum + (order.totalCents ?? order.amountCents), 0); return { label: dayLabel(date), value, height: Math.max(6, Math.round((value / max) * 100)) }; });
  return <><AdminPageHeader eyebrow="Visão geral" title="Acompanhe a operação." description="Dados reais de vendas, clientes e consultas." action={<Link href="/" className="admin-secondary-button">Ver site público <ArrowRight size={16}/></Link>}/><section className="admin-kpi-grid"><KpiCard label="Receita · 7 dias" value={brl(revenue)} detail={`${paid.length} pedidos pagos`}/><KpiCard label="Pedidos no período" value={String(orders.length)} detail={`${orders.filter((order) => order.status === 'PENDING').length} aguardando pagamento`}/><KpiCard label="Consultas realizadas" value={String(queries)} detail="Últimos 7 dias"/><KpiCard label="Clientes cadastrados" value={String(customers)} detail={`${products} produtos ativos`}/></section><div className="admin-dashboard-grid"><section className="admin-panel-card admin-chart-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Vendas reais</span><h2>Receita por dia</h2></div><BarChart3 size={20}/></div><div className="admin-bar-chart" aria-label="Gráfico de receita dos últimos sete dias">{chart.map((item) => <div className="admin-bar-column" key={item.label}><span>{item.value ? brl(item.value) : '—'}</span><i style={{ height: `${item.height}%` }}/><small>{item.label}</small></div>)}</div><p className="admin-chart-note">Valores calculados a partir de pedidos PAID e COMPLETED. Sem dados fictícios.</p></section><section className="admin-panel-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Operação</span><h2>Últimos pedidos</h2></div><Link href="/admin/pedidos" className="admin-text-link">Ver todos</Link></div><div className="admin-recent-list">{orders.slice(0, 5).map((order) => <div className="admin-recent-row" key={order.id}><span className="admin-recent-icon"><ShoppingBag size={16}/></span><div><strong>{order.product.name}</strong><small>{order.customer?.name || order.customer?.email || 'Cliente não identificado'} · {order.plate}</small></div><div><b>{brl(order.totalCents ?? order.amountCents)}</b><StatusBadge status={order.status} tone={order.status === 'PAID' || order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'}/></div></div>)}{!orders.length && <div className="admin-empty"><Clock3 size={20}/><h3>Nenhum pedido no período</h3><p>Assim que houver movimentação, ela aparecerá aqui.</p></div>}</div></section></div><section className="admin-panel-card admin-dashboard-footer-card"><CheckCircle2 size={18}/><div><strong>Indicadores conectados ao banco</strong><p>O dashboard não exibe métricas inventadas. Configure o pagamento e o tracking para ampliar o funil de conversão.</p></div><Link href="/admin/integracoes">Configurar integrações <ArrowRight size={15}/></Link></section></>;
}
