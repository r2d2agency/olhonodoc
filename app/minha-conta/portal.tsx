'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, CarFront, Check, ChevronRight, CircleHelp, Clock3, CreditCard, FileText, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
import { readJson } from '@/lib/client-response';
import AccountOverview from './account-overview';
import FeaturesAccordion from '@/components/features-accordion';
import FloatingWhatsApp from '@/components/floating-whatsapp';
import PaymentsTab from './payments-tab';
import VehiclesTab from './vehicles-tab';
import QueriesTab from './queries-tab';

type Tab = 'inicio' | 'veiculos' | 'consultas' | 'pagamentos' | 'perfil';
type Profile = { name: string; email: string; phone: string; cpf: string; postalCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string };
const emptyProfile: Profile = { name: '', email: '', phone: '', cpf: '', postalCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
export type AccountQuery = { id: string; plate: string; status: string; createdAt: string; totalCents: number | null; product: { name: string; slug: string }; payments?: { provider: string; status: string; checkoutUrl: string | null; method?: string | null }[]; ticketUrl?: string | null; query: { normalizedPlate: string; report: Record<string, any> | null; companyStatus: string | null; providerMessage: string | null; providerStatusText: string | null; codigoConsulta: string | null; hashPesquisa: string | null; requestSentAt: string | null; responseReceivedAt: string | null; reportPdfGeneratedAt: string | null; attempts: number } | null };

export default function CustomerPortal({ name, email, products, initialPlate, source }: { name: string; email: string; products: CatalogProduct[]; initialPlate: string; source: string }) {
  const [tab, setTab] = useState<Tab>('inicio'); const [queries, setQueries] = useState<AccountQuery[]>([]); const [queriesLoading, setQueriesLoading] = useState(true); const [profile, setProfile] = useState<Profile>(emptyProfile); const [profileMessage, setProfileMessage] = useState(''); const [profileError, setProfileError] = useState(''); const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' }); const [passwordMessage, setPasswordMessage] = useState(''); const [passwordError, setPasswordError] = useState('');
  const [plate, setPlate] = useState(initialPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7));
  const [showPlateForm, setShowPlateForm] = useState(!initialPlate);
  const [plateError, setPlateError] = useState('');
  const [showPlans, setShowPlans] = useState(Boolean(initialPlate)); const [aggregate, setAggregate] = useState<Record<string, unknown> | null>(null); const [aggregateLoading, setAggregateLoading] = useState(Boolean(initialPlate)); const [aggregateError, setAggregateError] = useState('');
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente';
  const featured = useMemo(() => products.find((product) => product.featured) || products[0], [products]);
  useEffect(() => { fetch('/api/account/profile').then(readJson).then(body => { if (body.data) setProfile(body.data); }).catch(() => undefined); }, [email]);
  async function saveProfile(event: React.FormEvent) { event.preventDefault(); setProfileError(''); setProfileMessage(''); const response = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); const body = await readJson(response); if (!response.ok) setProfileError(body.error || 'Não foi possível salvar.'); else { setProfile(body.data); setProfileMessage('Dados atualizados.'); } }
  async function changePassword(event: React.FormEvent) { event.preventDefault(); setPasswordError(''); setPasswordMessage(''); const response = await fetch('/api/account/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(passwords) }); const body = await readJson(response); if (!response.ok) setPasswordError(body.error || 'Não foi possível alterar a senha.'); else { setPasswordMessage(body.data.message); setPasswords({ currentPassword: '', newPassword: '' }); } }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }
  async function reloadQueries() { setQueriesLoading(true); try { const response = await fetch('/api/account/queries'); const body = await readJson(response); setQueries(body.data || []); } catch { setQueries([]); } finally { setQueriesLoading(false); } }
  // Volta do checkout com pedido confirmado: recarrega e abre "Minhas consultas" para o cliente ver o status.
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('pedido') === 'confirmado') {
      setTab('consultas');
      window.history.replaceState(null, '', '/minha-conta');
    }
  }, []);
  useEffect(() => { void reloadQueries(); }, [email]);
  const vehicleCount = new Set(queries.map((query) => query.plate)).size;
  async function loadAggregates(normalized: string) { setAggregate(null); setAggregateError(''); setAggregateLoading(true); try { const response = await fetch('/api/account/aggregates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plate: normalized }) }); const body = await readJson(response); if (!response.ok) throw new Error(body.error || 'Não foi possível consultar o veículo.'); if (body.data.status === 'AUTH_ERROR' || body.data.status === 'INVALID_INPUT' || body.data.status === 'FAILED') throw new Error(body.data.request?.mensagem || 'A Company não conseguiu concluir a consulta.'); if (body.data.status === 'PROCESSING') { setAggregateError('A Company recebeu a consulta e está processando os dados.'); return; } setAggregate(body.data.aggregates || null); } catch (error) { setAggregateError(error instanceof Error ? error.message : 'Não foi possível consultar o veículo.'); } finally { setAggregateLoading(false); } }
  useEffect(() => { if (initialPlate) void loadAggregates(initialPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()); }, [initialPlate]);

  function selectPlate(value: string) {
    const normalized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
    if (!normalized) return;
    setPlate(normalized); setShowPlateForm(false); setShowPlans(true);
    window.history.replaceState(null, '', `/minha-conta?placa=${normalized}`);
    void loadAggregates(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitPlate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (normalized.length !== 7) { setPlateError('Informe uma placa com 7 caracteres.'); return; }
    setPlateError(''); setShowPlans(true); setShowPlateForm(false);
    window.history.replaceState(null, '', `/minha-conta?placa=${normalized}${source ? `&origem=${encodeURIComponent(source)}` : ''}`);
    await loadAggregates(normalized);
  }

  return <main className="customer-portal">
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <Link href="/" className="customer-brand"><img src="/logo-olho-no-doc.png" alt="Olho no Doc" style={{height:64,width:"auto",objectFit:"contain"}}/></Link>
        <div className="customer-profile"><span className="customer-avatar">{firstName.slice(0, 1).toUpperCase()}</span><div><strong>{firstName}</strong><small>Área do cliente</small></div></div>
        <nav aria-label="Menu da área do cliente" className="customer-nav">
          <button className={tab === 'inicio' ? 'active' : ''} onClick={() => setTab('inicio')}><Sparkles size={17}/> Visão geral</button>
          <button className={tab === 'veiculos' ? 'active' : ''} onClick={() => setTab('veiculos')}><CarFront size={17}/> Meus veículos</button>
          <button className={tab === 'consultas' ? 'active' : ''} onClick={() => setTab('consultas')}><FileText size={17}/> Minhas consultas</button><button className={tab === 'pagamentos' ? 'active' : ''} onClick={() => setTab('pagamentos')}><CreditCard size={17}/> Pagamentos</button><button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}><ShieldCheck size={17}/> Meu cadastro</button>
        </nav>
        <div className="customer-sidebar-bottom"><button className="customer-logout-button" onClick={logout}>Sair da conta</button><div className="customer-help"><CircleHelp size={18}/><strong>Precisa de ajuda?</strong><p>Estamos aqui para ajudar você.</p><Link href="/contato">Fale com a gente <ArrowRight size={14}/></Link></div><Link href="/" className="customer-back">Voltar ao site <ChevronRight size={15}/></Link></div>
      </aside>

      <section className="customer-main">
        <header className="customer-topbar"><div className="customer-breadcrumb">Minha conta <ChevronRight size={14}/> <span>{tab === 'inicio' ? 'Visão geral' : tab === 'veiculos' ? 'Meus veículos' : tab === 'pagamentos' ? 'Pagamentos' : 'Minhas consultas'}</span></div><div className="customer-top-actions"><span className="customer-protected"><ShieldCheck size={15}/> Área segura</span><button aria-label="Notificações" className="customer-icon-button" title="Notificações"><Bell size={18}/></button></div></header>

        {tab === 'inicio' && <>
          <section className="customer-welcome"><div><span className="customer-eyebrow">SEU ESPAÇO, SUAS DECISÕES</span><h1>Olá, {firstName}<span>.</span></h1><p>Escolha uma placa e a consulta certa para decidir com mais segurança.</p></div><div className="customer-welcome-art"><div className="customer-orbit orbit-one"/><div className="customer-orbit orbit-two"/><CarFront size={48}/><span>OD</span></div></section>
          <div className="customer-status-strip"><div className="customer-status-icon"><Clock3 size={19}/></div><div><strong>{queries.length ? `${queries.length} consulta(s) no seu histórico` : 'Seu histórico começa aqui'}</strong><p>{queries.length ? `${vehicleCount} veículo(s) acompanhado(s) na sua conta.` : 'Assim que você fizer uma consulta, o andamento e o relatório aparecerão nesta área.'}</p></div><span className="customer-status-pill">Tudo em dia</span></div>
          <section className="customer-start-card">{initialPlate && <div className="customer-aggregate-banner">{aggregateLoading ? <><Clock3 size={18}/> Buscando os dados básicos da placa {plate}…</> : aggregateError ? <><CircleHelp size={18}/> {aggregateError}</> : aggregate ? <><CarFront size={18}/><div><strong>{String(aggregate.marca || 'Marca não informada')} {String(aggregate.modelo || '')}</strong><div className="customer-aggregate-details">{[['Placa', 'placa'], ['Ano modelo', 'anoModelo'], ['Ano fabricação', 'anoFabricacao'], ['Cor', 'cor'], ['Combustível', 'combustivel'], ['Situação', 'situacao'], ['UF', 'Uf'], ['Município', 'municipio'], ['Chassi', 'chassi']].map(([label, key]) => <span key={key}><small>{label}</small><b>{String(aggregate[key] || 'Não informado')}</b></span>)}</div></div><Check size={18}/></> : <><Clock3 size={18}/> Não encontramos dados agregados para esta placa.</>}</div>}<div className="customer-section-title"><div><span className="customer-eyebrow">VEÍCULO EM ANÁLISE</span><h2>{plate || initialPlate ? `Placa ${plate || initialPlate}` : 'Qual carro você está avaliando?'}</h2><p>{plate || initialPlate ? 'Dados básicos do veículo que você está avaliando.' : 'Informe a placa para avançar para as opções de consulta.'}</p></div><span className="customer-step">01 <i>/ 02</i></span></div>
            {showPlateForm && <form className="customer-plate-form" onSubmit={submitPlate}><label htmlFor="customer-plate">Placa do veículo</label><div className="customer-plate-row"><div className="customer-plate-input"><span>BR</span><input id="customer-plate" value={plate} onChange={(event) => { setPlateError(''); setPlate(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)); }} placeholder="ABC1D23" maxLength={7} autoComplete="off" aria-invalid={Boolean(plateError)} aria-describedby={plateError ? 'customer-plate-error' : undefined}/></div><button className="customer-primary-button" type="submit">Ver consultas disponíveis <ArrowRight size={17}/></button></div>{plateError && <p id="customer-plate-error" className="customer-inline-error" role="alert">{plateError}</p>}</form>}
          </section>
          <section className="customer-plan-section"><div className="customer-section-title"><div><span className="customer-eyebrow">ESCOLHA SUA CONSULTA</span><h2>Qual consulta vamos fazer hoje?</h2><p>Selecione o nível de informação para a placa {plate || initialPlate}.</p></div><span className="customer-step">02 <i>/ 02</i></span></div><div className="customer-vehicle-preview"><div className="customer-vehicle-icon"><CarFront size={23}/></div><div><small>PLACA INFORMADA</small><strong>{plate || initialPlate}</strong></div><span className="customer-not-connected">{aggregate ? <><Check size={14}/> Dados básicos carregados</> : <><Clock3 size={14}/> Aguardando dados disponíveis</>}</span></div><div className="customer-product-grid">{products.map((product) => <article className={`customer-product-card ${product.slug === featured?.slug ? 'recommended' : ''}`} key={product.slug}>{product.slug === featured?.slug && <span className="customer-recommended"><Sparkles size={13}/> Mais completa</span>}<h3>{product.name}</h3><p>{product.description}</p><FeaturesAccordion features={product.features} compact /><div className="customer-product-bottom"><div><small>Por consulta</small><strong>{product.price}</strong></div><Link className="customer-select-plan" href={`/checkout?produto=${encodeURIComponent(product.slug)}&placa=${encodeURIComponent(plate || initialPlate)}`}>Selecionar <ArrowRight size={15}/></Link></div></article>)}</div><div className="customer-integration-note"><span><ShieldCheck size={16}/></span><p><strong>Próximo passo: seus dados de compra</strong> Ao selecionar um plano, você informa o endereço e revisa o pedido. O pagamento será confirmado em uma etapa própria.</p></div></section>
          <section className="customer-upsell"><div className="customer-upsell-icon"><CarFront size={21}/></div><div><span className="customer-eyebrow">NOVA PLACA</span><h3>Precisa consultar outro veículo?</h3><p>Informe outra placa para começar uma nova análise.</p></div><button className="customer-secondary-button" onClick={() => { setPlate(''); setAggregate(null); setShowPlans(false); setShowPlateForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Consultar nova placa <Plus size={15}/></button></section>
        </>}

        {tab === 'veiculos' && <VehiclesTab queries={queries} onNewQuery={() => setTab('inicio')} />}

        {tab === 'perfil' && <section className="customer-tab-content"><span className="customer-eyebrow">MINHA CONTA</span><h1>Meu cadastro</h1><p>Atualize seus dados para agilizar suas próximas compras.</p><div className="customer-account-grid"><form className="customer-account-card" onSubmit={saveProfile}><h2>Dados pessoais</h2><label>Nome<input required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></label><label>E-mail<input value={profile.email} disabled/></label><label>WhatsApp<input required value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/></label><label>CPF<input value={profile.cpf} disabled/></label><h2>Endereço</h2><div className="customer-account-fields">{[['postalCode','CEP'],['street','Rua'],['number','Número'],['complement','Complemento'],['neighborhood','Bairro'],['city','Cidade'],['state','UF']].map(([key,label]) => <label key={key}>{label}<input value={profile[key as keyof Profile]} onChange={e => setProfile({ ...profile, [key]: e.target.value })}/></label>)}</div>{profileError && <p className="customer-inline-error">{profileError}</p>}{profileMessage && <p className="customer-success-message">{profileMessage}</p>}<button className="customer-primary-button">Salvar dados</button></form><div className="customer-account-card"><form onSubmit={changePassword}><h2>Segurança</h2><label>Senha atual<input required type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}/></label><label>Nova senha<input required minLength={8} type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}/></label>{passwordError && <p className="customer-inline-error">{passwordError}</p>}{passwordMessage && <p className="customer-success-message">{passwordMessage}</p>}<button className="customer-primary-button">Alterar senha</button></form></div></div></section>}{tab === 'consultas' && <QueriesTab queries={queries} loading={queriesLoading} onReload={reloadQueries} onNewQuery={() => setTab('inicio')} />}{tab === 'pagamentos' && <PaymentsTab />}
      </section>
    </div>
    <footer className="customer-footer"><div><img src="/logo-olho-no-doc.png" alt="Olho no Doc"/><span>Informação para você decidir melhor antes de comprar um veículo.</span></div><small>Olho no Doc Tecnologia e Informações Veiculares Ltda · CNPJ 69.283.015/0001-00</small></footer>
    <FloatingWhatsApp />
  </main>;
}
