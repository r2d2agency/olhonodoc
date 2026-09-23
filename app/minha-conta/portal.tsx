'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowRight, Bell, CarFront, Check, ChevronRight, CircleHelp, Clock3, FileText, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';

type Tab = 'inicio' | 'veiculos' | 'consultas';

export default function CustomerPortal({ name, products, initialPlate, source }: { name: string; products: CatalogProduct[]; initialPlate: string; source: string }) {
  const [tab, setTab] = useState<Tab>('inicio');
  const [plate, setPlate] = useState(initialPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7));
  const [plateError, setPlateError] = useState('');
  const [showPlans, setShowPlans] = useState(Boolean(initialPlate));
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente';
  const featured = useMemo(() => products.find((product) => product.featured) || products[0], [products]);

  function submitPlate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (normalized.length !== 7) {
      setPlateError('Informe uma placa com 7 caracteres.');
      return;
    }
    setPlateError('');
    setShowPlans(true);
    window.history.replaceState(null, '', `/minha-conta?placa=${normalized}${source ? `&origem=${encodeURIComponent(source)}` : ''}`);
  }

  return <main className="customer-portal">
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <Link href="/" className="customer-brand"><span className="customer-brand-mark">◉</span><span>olho<span>no</span>doc</span></Link>
        <div className="customer-profile"><span className="customer-avatar">{firstName.slice(0, 1).toUpperCase()}</span><div><strong>{firstName}</strong><small>Área do cliente</small></div></div>
        <nav aria-label="Menu da área do cliente" className="customer-nav">
          <button className={tab === 'inicio' ? 'active' : ''} onClick={() => setTab('inicio')}><Sparkles size={17}/> Visão geral</button>
          <button className={tab === 'veiculos' ? 'active' : ''} onClick={() => setTab('veiculos')}><CarFront size={17}/> Meus veículos</button>
          <button className={tab === 'consultas' ? 'active' : ''} onClick={() => setTab('consultas')}><FileText size={17}/> Minhas consultas</button>
        </nav>
        <div className="customer-sidebar-bottom"><div className="customer-help"><CircleHelp size={18}/><strong>Precisa de ajuda?</strong><p>Estamos aqui para ajudar você.</p><Link href="/contato">Fale com a gente <ArrowRight size={14}/></Link></div><Link href="/" className="customer-back">Voltar ao site <ChevronRight size={15}/></Link></div>
      </aside>

      <section className="customer-main">
        <header className="customer-topbar"><div className="customer-breadcrumb">Minha conta <ChevronRight size={14}/> <span>{tab === 'inicio' ? 'Visão geral' : tab === 'veiculos' ? 'Meus veículos' : 'Minhas consultas'}</span></div><div className="customer-top-actions"><span className="customer-protected"><ShieldCheck size={15}/> Área segura</span><button aria-label="Notificações" className="customer-icon-button" title="Notificações"><Bell size={18}/></button></div></header>

        {tab === 'inicio' && <>
          <section className="customer-welcome"><div><span className="customer-eyebrow">SEU ESPAÇO, SUAS DECISÕES</span><h1>Olá, {firstName}<span>.</span></h1><p>Acompanhe seus veículos e encontre a consulta certa para decidir com mais segurança.</p></div><div className="customer-welcome-art"><div className="customer-orbit orbit-one"/><div className="customer-orbit orbit-two"/><CarFront size={48}/><span>OD</span></div></section>
          <div className="customer-status-strip"><div className="customer-status-icon"><Clock3 size={19}/></div><div><strong>Seu histórico começa aqui</strong><p>Assim que você fizer uma consulta, o andamento e o relatório aparecerão nesta área.</p></div><span className="customer-status-pill">Tudo em dia</span></div>
          <section className="customer-start-card"><div className="customer-section-title"><div><span className="customer-eyebrow">COMECE PELO VEÍCULO</span><h2>Qual carro você está avaliando?</h2><p>Informe a placa para avançar para as opções de consulta.</p></div><span className="customer-step">01 <i>/ 03</i></span></div>
            <form className="customer-plate-form" onSubmit={submitPlate}><label htmlFor="customer-plate">Placa do veículo</label><div className="customer-plate-row"><div className="customer-plate-input"><span>BR</span><input id="customer-plate" value={plate} onChange={(event) => { setPlateError(''); setPlate(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)); }} placeholder="ABC1D23" maxLength={7} autoComplete="off" aria-invalid={Boolean(plateError)} aria-describedby={plateError ? 'customer-plate-error' : undefined}/></div><button className="customer-primary-button" type="submit">Ver consultas disponíveis <ArrowRight size={17}/></button></div>{plateError && <p id="customer-plate-error" className="customer-inline-error" role="alert">{plateError}</p>}<p className="customer-privacy-note"><ShieldCheck size={14}/> Seus dados são tratados com segurança. A validação dos dados do veículo será conectada na próxima etapa.</p></form>
          </section>
          {showPlans && <section className="customer-plan-section"><div className="customer-section-title"><div><span className="customer-eyebrow">ESCOLHA COM CONTEXTO</span><h2>Consultas para cada momento</h2><p>Opções disponíveis no catálogo. A consulta e os dados agregados serão habilitados após a integração.</p></div></div><div className="customer-vehicle-preview"><div className="customer-vehicle-icon"><CarFront size={23}/></div><div><small>PLACA INFORMADA</small><strong>{plate || initialPlate}</strong></div><span className="customer-not-connected"><Clock3 size={14}/> Dados do veículo aguardando integração</span></div><div className="customer-product-grid">{products.map((product) => <article className={`customer-product-card ${product.slug === featured?.slug ? 'recommended' : ''}`} key={product.slug}>{product.slug === featured?.slug && <span className="customer-recommended"><Sparkles size={13}/> Mais completa</span>}<h3>{product.name}</h3><p>{product.description}</p><ul>{product.features.slice(0, 3).map((feature) => <li key={feature}><Check size={14}/>{feature}</li>)}</ul><div className="customer-product-bottom"><div><small>Por consulta</small><strong>{product.price}</strong></div><button disabled title="Checkout será conectado após a definição da integração">Selecionar <ArrowRight size={15}/></button></div></article>)}</div><div className="customer-integration-note"><span><Clock3 size={16}/></span><p><strong>Próximo passo: checkout integrado</strong> A seleção, o pagamento e o envio da consulta serão ativados quando finalizarmos as integrações.</p></div></section>}
          <section className="customer-upsell"><div className="customer-upsell-icon"><Search size={21}/></div><div><span className="customer-eyebrow">MAIS CONTEXTO PARA SUA ESCOLHA</span><h3>Compare as consultas antes de decidir</h3><p>Veja as diferenças entre os níveis de informação disponíveis.</p></div><Link href="/comparar-consultas">Comparar opções <ArrowRight size={16}/></Link></section>
          {!showPlans && <section className="customer-empty-card"><span className="customer-empty-icon"><CarFront size={24}/></span><div><h3>Nenhum veículo por enquanto</h3><p>Quando você iniciar uma consulta, seus veículos e o histórico serão organizados aqui.</p></div><button onClick={() => document.getElementById('customer-plate')?.focus()}>Adicionar veículo <Plus size={16}/></button></section>}
        </>}

        {tab === 'veiculos' && <section className="customer-tab-content"><span className="customer-eyebrow">GARAGEM</span><h1>Meus veículos</h1><p>Os veículos associados às suas consultas ficarão reunidos nesta área.</p><div className="customer-empty-card"><span className="customer-empty-icon"><CarFront size={24}/></span><div><h3>Sua garagem está vazia</h3><p>Informe uma placa na visão geral para começar. Os dados do veículo serão carregados quando a integração estiver disponível.</p></div><button onClick={() => setTab('inicio')}>Informar placa <ArrowRight size={16}/></button></div></section>}

        {tab === 'consultas' && <section className="customer-tab-content"><span className="customer-eyebrow">ACOMPANHAMENTO</span><h1>Minhas consultas</h1><p>Veja os estados previstos para acompanhar suas solicitações e relatórios.</p><div className="customer-lifecycle"><div className="customer-lifecycle-head"><div><span className="customer-eyebrow">COMO FUNCIONA O ANDAMENTO</span><h2>Do pedido ao relatório</h2></div><span className="customer-demo-badge">ETAPAS ILUSTRATIVAS</span></div><div className="customer-lifecycle-steps"><article><span className="lifecycle-step-icon"><Check size={17}/></span><small>01 · PEDIDO</small><h3>Pagamento confirmado</h3><p>O status será atualizado após a confirmação do checkout.</p></article><article><span className="lifecycle-step-icon pending"><Clock3 size={17}/></span><small>02 · PROCESSAMENTO</small><h3>Consulta pendente</h3><p>A solicitação aguarda o retorno do provedor integrado.</p></article><article><span className="lifecycle-step-icon"><FileText size={17}/></span><small>03 · ENTREGA</small><h3>Relatório disponível</h3><p>O resultado poderá ser visualizado e baixado nesta área.</p></article></div><div className="customer-no-orders"><FileText size={21}/><div><strong>Você ainda não tem consultas registradas</strong><p>Quando houver uma solicitação real, ela aparecerá aqui com o status atualizado.</p></div><button onClick={() => setTab('inicio')}>Iniciar consulta <ArrowRight size={15}/></button></div></div><div className="customer-download-hint"><ArrowDownToLine size={18}/><p>O download ficará disponível junto ao relatório após a resposta da consulta. Nenhum relatório foi emitido ainda.</p></div></section>}
      </section>
    </div>
  </main>;
}
