import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, RefreshCw } from 'lucide-react';

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="admin-page-header"><div><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>; }

export function KpiCard({ label, value, change, positive = true, detail }: { label: string; value: string; change?: string; positive?: boolean; detail?: string }) { return <article className="admin-kpi"><span>{label}</span><strong>{value}</strong>{change && <small className={positive ? 'kpi-positive' : 'kpi-negative'}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}</small>}{detail && <small className="kpi-detail">{detail}</small>}</article>; }

export function StatusBadge({ status, tone = 'neutral' }: { status: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) { return <span className={`admin-status ${tone}`}><i/>{status}</span>; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="admin-empty"><span><Clock3 size={20}/></span><h3>{title}</h3><p>{description}</p>{action}</div>; }

export function AttentionItem({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href: string }) { return <a className="attention-item" href={href}><span className="attention-icon">{icon}</span><span><strong>{title}</strong><small>{value}</small></span><ArrowUpRight size={16}/></a>; }

export function LoadingState() { return <div className="admin-loading"><RefreshCw className="spin" size={20}/> Carregando dados...</div>; }
export function ErrorState({ message = 'Não foi possível carregar os dados.', onRetry }: { message?: string; onRetry?: () => void }) { return <div className="admin-error-state"><AlertTriangle size={20}/><span>{message}</span>{onRetry && <button onClick={onRetry}>Tentar novamente</button>}</div>; }
export function SuccessIcon() { return <CheckCircle2 size={16}/>; }
