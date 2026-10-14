import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, CreditCard, FileSearch, Gavel, KeyRound, LockKeyhole, Phone, ScanLine, ShieldCheck, Siren, Wrench } from 'lucide-react';
import { FAQ, PlateInput, ProductCard, ReportPreview } from '@/components/site';
import { products } from '@/data/products';

const faqs = [
  { q: 'A Olho no Doc é um órgão do governo?', a: 'Não. Somos uma empresa privada, sem vínculo com Detran, Senatran ou qualquer órgão público. Trabalhamos exclusivamente com serviços de consulta de informações veiculares.' },
  { q: 'Vocês pagam ou regularizam débitos do veículo?', a: 'Não. Oferecemos exclusivamente serviços de consulta de informações veiculares; não realizamos pagamento, parcelamento ou regularização de débitos.' },
  { q: 'Em quanto tempo recebo o relatório?', a: 'Após a confirmação do pagamento, o relatório fica pronto em poucos minutos e é exibido na tela e enviado para o seu e-mail.' },
  { q: 'Quais formas de pagamento são aceitas?', a: 'Pix e cartão de crédito, processados em ambiente seguro.' },
  { q: 'E se a consulta não retornar resultado?', a: 'Se houver falha técnica e o relatório não for entregue, entre em contato pelo nosso atendimento para reprocessamento ou reembolso, conforme nossos Termos de Uso.' },
  { q: 'Meus dados ficam protegidos?', a: 'Sim. Tratamos seus dados conforme a LGPD e usamos só o necessário para entregar sua consulta. Veja nossa Política de Privacidade.' }
];

const checks = [
  { icon: Gavel, title: 'Passagem por leilão', text: 'Saiba se o veículo já foi leiloado e em que condições, um dos fatores que mais derrubam o valor de revenda.' },
  { icon: Siren, title: 'Sinistro e perda total', text: 'Verifique registros de acidentes, indenizações e indícios de perda total.' },
  { icon: ShieldCheck, title: 'Roubo e furto', text: 'Confira se há ou já houve registro de roubo ou furto para o veículo.' },
  { icon: LockKeyhole, title: 'Restrições e gravame', text: 'Identifique alienação fiduciária, financiamento ativo e bloqueios que impedem a transferência.' },
  { icon: Wrench, title: 'Recall', text: 'Veja se o modelo tem chamados de recall do fabricante ainda pendentes.' },
  { icon: FileSearch, title: 'Dados cadastrais', text: 'Marca, modelo, ano, cor, chassi parcial e características para conferir com o documento.' }
];

const steps = [
  { n: '01', title: 'Digite a placa', text: 'Informe a placa do veículo que você está avaliando.' },
  { n: '02', title: 'Pague com segurança', text: 'Pix ou cartão, em ambiente protegido. Você vê o valor antes de confirmar.' },
  { n: '03', title: 'Receba o relatório', text: 'O relatório fica pronto em poucos minutos, na tela e no seu e-mail.' }
];

export default function Home() { return <main className="home-shell">
  <section className="hero" id="consultar"><div className="hero-inner"><div className="hero-copy">
    <h1>Descubra o passado do carro <mark>antes</mark> de fechar negócio.</h1>
    <p className="hero-sub">Digite a placa e receba em minutos um relatório com passagem por leilão, sinistro, roubo e furto, restrições e muito mais.</p>
    <PlateInput/>
    <div className="hero-trust"><span><LockKeyhole size={14}/> Pagamento seguro</span><span><Check size={14}/> Relatório em minutos</span><span><ShieldCheck size={14}/> Dados protegidos (LGPD)</span></div>
  </div><div className="hero-visual"><div className="mock">
    <div className="mock-head"><div><b>Relatório veicular</b><br/><small>Exemplo ilustrativo</small></div><span className="mock-plate">ABC1D23</span></div>
    <div className="mock-row">Passagem por leilão <span className="tag al">Encontrado</span></div>
    <div className="mock-row">Registro de sinistro <span className="tag al">Encontrado</span></div>
    <div className="mock-row">Roubo e furto <span className="tag ok">Nada consta</span></div>
    <div className="mock-row">Restrições / gravame <span className="tag ok">Nada consta</span></div>
    <div className="mock-row">Recall pendente <span className="tag ok">Nada consta</span></div>
    <div className="score"><div className="score-n">2</div><small><b style={{ color: 'var(--ink)' }}>pontos de atenção</b><br/>Avalie com cuidado antes de comprar.</small></div>
  </div></div></div></section>
  <div className="stats"><div className="stats-box">
    <div className="stat"><b>+00 mil</b><span>consultas realizadas</span></div>
    <div className="stat"><b>~2 min</b><span>tempo médio de entrega</span></div>
    <div className="stat"><b>00+</b><span>itens verificados</span></div>
    <div className="stat"><b>4,9/5</b><span>avaliação dos clientes</span></div>
  </div></div>
  <section className="section checks-section" id="o-que-consultamos"><div className="section-heading centered"><span className="eyebrow">O que entra no relatório</span><h2>Tudo o que você precisa saber, em um só lugar</h2><p className="lead">Informações reunidas de bases oficiais e privadas para você negociar com segurança.</p></div><div className="checks-grid">{checks.map(({ icon: Icon, title, text }) => <div className="check" key={title}><div className="icon"><Icon size={22}/></div><h3>{title}</h3><p>{text}</p></div>)}</div></section>
  <section className="section steps-section" id="como-funciona"><div className="section-heading centered"><span className="eyebrow">Como funciona</span><h2>Simples assim, em 3 passos</h2></div><div className="steps-grid">{steps.map(step => <div className="step" key={step.n}><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
  <section className="section why-section"><div className="why-grid"><div className="why-copy"><span className="eyebrow">Por que consultar</span><h2>Um carro bonito por fora pode esconder um histórico caro</h2><p className="lead">Leilão, sinistro e restrições nem sempre aparecem numa vistoria visual. A consulta mostra o que o vendedor pode não contar.</p><ul className="why-list"><li><div><b>Negocie com argumentos.</b> Use o relatório para pedir desconto ou desistir na hora certa.</div></li><li><div><b>Evite dor de cabeça na transferência.</b> Restrições descobertas depois custam tempo e dinheiro.</div></li><li><div><b>Proteja a revenda.</b> Carro com passagem por leilão pode valer bem menos no futuro.</div></li></ul></div><div className="why-card"><h3>Quanto custa não consultar?</h3><p>Um veículo com histórico de leilão costuma ser revendido com deságio em relação à tabela.</p><div className="big">até 30%</div><p>de desvalorização estimada na revenda.*</p><Link className="button" href="/consultas">Consultar por R$ 49,90</Link><small className="fine">*Ajustar com a fonte do dado antes de publicar.</small></div></div></section>
  <section className="section pricing-section" id="preco"><div className="section-heading centered"><span className="eyebrow">Preço</span><h2>Relatório completo, preço único</h2><p className="lead">Sem mensalidade e sem surpresa. Você paga só pela consulta que fizer.</p></div><div className="price-card"><span className="badge">Use o cupom e economize</span><h3>Consulta Veicular Completa</h3><p className="old">de R$ 59,90</p><div className="price"><small>R$</small>49,90</div><p className="price-note">por consulta · pagamento único</p><ul className="price-list"><li>Passagem por leilão</li><li>Sinistro, roubo e furto</li><li>Restrições, gravame e recall</li><li>Relatório em PDF no seu e-mail</li></ul><Link className="button" href="/consultas">Consultar minha placa</Link><div className="pay"><span>Pix</span>·<span>Cartão de crédito</span>·<span>Ambiente seguro</span></div></div></section>
  <section className="section products-section"><div className="section-heading"><div><span className="eyebrow">Escolha seu nível de informação</span><h2>Uma consulta para cada momento.</h2></div><Link className="text-link" href="/comparar-consultas">Comparar consultas <ArrowRight size={16}/></Link></div><div className="product-grid">{products.slice(0, 3).map((product, index) => <ProductCard key={product.slug} product={product} featured={index === 0}/>)}</div></section>
  <section className="section report-section"><div className="section-heading"><div><span className="eyebrow">Resultado claro</span><h2>Veja como o resultado chega até você.</h2></div><Link className="text-link" href="/exemplo-relatorio">Ver exemplo completo <ArrowRight size={16}/></Link></div><div className="report-layout"><ReportPreview/><div className="report-aside"><span className="aside-number">01</span><h3>Sem complicação para interpretar.</h3><p>O resultado é organizado para você encontrar os pontos mais importantes da consulta e saber onde prestar atenção.</p><Link className="button button-outline" href="/exemplo-relatorio">Explorar relatório <ArrowRight size={16}/></Link></div></div></section>
  <section className="section testimonials-section"><div className="section-heading centered"><span className="eyebrow">Quem já consultou</span><h2>Compras mais seguras todos os dias</h2></div><div className="tests">{[0, 1, 2].map((i) => <div className="test" key={i}><p>Espaço para depoimento real de cliente, com autorização para publicação.</p><b>Nome do cliente · Cidade/UF</b></div>)}</div></section>
  <section className="section faq-section" id="duvidas"><div className="section-heading centered"><span className="eyebrow">Dúvidas frequentes</span><h2>Perguntas que todo mundo faz</h2></div><FAQ items={faqs}/></section>
  <section className="cta-section"><div className="cta"><h2>Vai comprar um carro? Coloque o olho no doc primeiro.</h2><p>Relatório completo em minutos, por R$ 49,90. Sua tranquilidade é nosso foco.</p><Link className="button" href="/consultas">Consultar placa agora</Link></div></section>
</main>; }