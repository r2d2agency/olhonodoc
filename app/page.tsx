import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, FileSearch, Gavel, LockKeyhole, ShieldCheck, Siren, Wrench } from 'lucide-react';
import { FAQ, PlateInput, ProductCard, ReportPreview } from '@/components/site';
import { products } from '@/data/products';
import './home.css';

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

export default function Home() {
  return (
    <div className="home-shell">
      <div className="topbar">CONSULTA VEICULAR ONLINE <span aria-hidden="true">•</span> SUA TRANQUILIDADE É NOSSO FOCO</div>
      <header className="home-header">
        <div className="container headrow">
          <Link href="/" aria-label="Olho no Doc — página inicial">
            <Image className="logo" src="/logo-olho-no-doc.png" alt="Olho no Doc" width={919} height={637} priority />
          </Link>
          <nav className="menu" aria-label="Navegação principal">
            <a href="#o-que-consultamos">O que consultar</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Consultas</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <Link className="button header-cta" href="#consultar">Consultar placa <ArrowRight size={16} /></Link>
        </div>
      </header>

      <main>
        <section className="hero" id="consultar">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Vai comprar um carro usado?</span>
              <h1>O carro parece perfeito. <span>E o histórico dele?</span></h1>
              <p className="hero-sub">Descubra informações importantes sobre o veículo antes de fechar negócio. Consulte pela placa e compre com mais confiança.</p>
              <div className="search-card"><PlateInput /></div>
              <div className="hero-trust">
                <span><LockKeyhole size={15} /> Pagamento seguro</span>
                <span><Check size={15} /> Relatório em minutos</span>
                <span><ShieldCheck size={15} /> Dados protegidos (LGPD)</span>
              </div>
            </div>
            <div className="visual">
              <div className="car-photo" role="img" aria-label="Carro usado em destaque" />
              <div className="floating fl1"><strong><span className="dot" />Histórico do veículo</strong><p>Conheça registros disponíveis antes de comprar.</p></div>
              <div className="floating fl2"><strong>Mais informação, menos dúvida</strong><p>Compare os dados antes de negociar.</p></div>
            </div>
          </div>
        </section>

        <div className="strip" aria-label="Informações que você pode consultar">
          <div className="container striprow">
            <span><Check size={15} /> Leilão</span>
            <span><Check size={15} /> Sinistro</span>
            <span><Check size={15} /> Roubo e furto</span>
            <span><Check size={15} /> Restrições</span>
            <span><Check size={15} /> Recall</span>
          </div>
        </div>

        <section className="section soft" id="o-que-consultamos">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">O que entra no relatório</span>
              <h2>Tudo o que você precisa saber, em um só lugar.</h2>
              <p className="lead">Informações que ajudam você a avaliar o veículo com mais clareza. A disponibilidade varia conforme o plano e as bases consultadas.</p>
            </div>
            <div className="checks-grid">
              {checks.map(({ icon: Icon, title, text }, index) => (
                <article className="check" key={title}>
                  <div className="icon"><Icon size={22} /></div>
                  <span className="check-number">{String(index + 1).padStart(2, '0')} / CONSULTA</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section proof">
          <div className="container proof-grid">
            <div className="proof-photo" role="img" aria-label="Carro estacionado visto de lado" />
            <div className="proof-copy">
              <span className="eyebrow">A aparência não mostra tudo</span>
              <h2>Gostou do carro? Conheça a história antes de se apaixonar.</h2>
              <p className="lead">Uma pintura bonita e um bom test-drive não contam tudo sobre um veículo. A consulta ajuda a observar pontos que merecem atenção antes de assinar o contrato.</p>
              <ul className="proof-list">
                <li><Check size={17} /> Mais informação para negociar</li>
                <li><Check size={17} /> Dados para avaliar o veículo</li>
                <li><Check size={17} /> Menos surpresas depois da compra</li>
              </ul>
              <Link className="button" href="#consultar">Quero consultar agora <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <section className="report-section">
          <div className="container report-layout">
            <div className="report-aside">
              <span className="eyebrow">Resultado claro</span>
              <h2>Um relatório que ajuda você a decidir.</h2>
              <p className="lead">As informações ficam organizadas para você identificar rapidamente o que merece atenção.</p>
              <Link className="button button-outline" href="/exemplo-relatorio">Ver exemplo de relatório <ArrowRight size={16} /></Link>
            </div>
            <ReportPreview />
          </div>
        </section>

        <section className="section steps-section" id="como-funciona">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">Fácil, rápido e online</span>
              <h2>Consulte em 3 passos.</h2>
              <p className="lead">Sem complicação. Da placa ao relatório, um processo simples.</p>
            </div>
            <div className="steps-grid">
              {steps.map((step) => (
                <article className="step" key={step.n}>
                  <span className="step-number">{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section products-section" id="planos">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Escolha seu nível de informação</span>
                <h2>Uma consulta para cada momento.</h2>
                <p className="lead">Compare as opções disponíveis e escolha o relatório ideal para sua decisão.</p>
              </div>
              <Link className="text-link" href="/comparar-consultas">Comparar consultas <ArrowRight size={16} /></Link>
            </div>
            <div className="product-grid">
              {products.slice(0, 3).map((product, index) => (
                <ProductCard key={product.slug} product={product} featured={index === 0} />
              ))}
            </div>
          </div>
        </section>

        <section className="section faq-section" id="duvidas">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">Dúvidas frequentes</span>
              <h2>Perguntas que todo mundo faz.</h2>
            </div>
            <FAQ items={faqs} />
          </div>
        </section>

        <section className="final">
          <div className="container">
            <h2>Antes de comprar, coloque o Olho no Doc.</h2>
            <p>Uma decisão importante merece mais do que boas fotos. Consulte a história do veículo e negocie com mais informação.</p>
            <Link className="button" href="#consultar">Consultar placa agora <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container footerrow">
          <div>
            <Link href="/" aria-label="Olho no Doc — página inicial">
              <Image className="footer-logo" src="/logo-olho-no-doc.png" alt="Olho no Doc" width={919} height={637} />
            </Link>
            <p>Informação para você decidir melhor antes de comprar um veículo.</p>
          </div>
          <nav aria-label="Links institucionais">
            <Link href="/consultas">Consultas</Link>
            <Link href="/exemplo-relatorio">Exemplo de relatório</Link>
            <Link href="/politica-de-privacidade">Privacidade</Link>
            <Link href="/termos-de-uso">Termos de uso</Link>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Olho no Doc.</span>
          <span>Consulte antes de comprar.</span>
        </div>
      </footer>

      <div className="mobile-cta">
        <Link className="button" href="#consultar">Consultar minha placa <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}