import Link from 'next/link';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="home-shell">
      <div className="topbar">CONSULTA VEICULAR ONLINE • SUA TRANQUILIDADE É NOSSO FOCO</div>

      <header className="header">
        <div className="container headrow">
          <Link href="/">
            <img className="logo" src="/logo-olho-no-doc.png" alt="Olho no Doc" />
          </Link>
          <nav className="menu">
            <a href="#informacoes">O que consultar</a>
            <a href="#funciona">Como funciona</a>
            <a href="#planos">Consultas</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <Link className="btn" href="#consulta">Consultar placa <span>↗</span></Link>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow reveal">Vai comprar um carro usado?</div>
              <h1 className="reveal">O carro parece perfeito. <span>E o histórico dele?</span></h1>
              <p className="hero-copy reveal">Descubra informações importantes sobre o veículo antes de fechar negócio. Consulte pela placa e compre com mais confiança.</p>
              <form id="consulta" className="searchcard reveal" action="/consultas" method="get">
                <label htmlFor="plate">Digite a placa para começar</label>
                <div className="searchrow">
                  <div className="plate">
                    <span>BR</span>
                    <input id="plate" name="placa" type="text" maxLength={7} placeholder="ABC1D23" pattern="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}" autoComplete="off" required aria-label="Placa do veículo" />
                  </div>
                  <button type="submit" className="btn">Consultar veículo ↗</button>
                </div>
                <p className="hint" id="formhint">Você será direcionado para escolher a consulta e prosseguir.</p>
              </form>
              <div className="hero-points">
                <span><b>✓</b> Consulta online</span>
                <span><b>✓</b> Pagamento por consulta</span>
                <span><b>✓</b> Relatório para sua decisão</span>
              </div>
            </div>
            <div className="visual reveal">
              <img className="car-photo" src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=82" alt="Automóvel em destaque" />
              <div className="floating fl1"><strong><i className="dot"></i>Histórico do veículo</strong><p>Conheça registros disponíveis antes de comprar.</p></div>
              <div className="floating fl2"><strong>Mais informação, menos dúvida</strong><p>Compare os dados antes de negociar.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="informacoes">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">O que você pode descobrir</div>
              <h2 className="title">Informações que ajudam a decidir antes de comprar.</h2>
              <p className="sub">A cobertura depende do produto escolhido e das bases consultadas.</p>
            </div>
            <div className="info-grid">
              {[
                { t: 'Dados cadastrais', d: 'Identificação do veículo, marca, modelo, ano, cor e outros dados disponíveis.' },
                { t: 'Roubo e furto', d: 'Verifique registros disponíveis de roubo ou furto.' },
                { t: 'Leilão', d: 'Saiba se o veículo consta em registros de leilão.' },
                { t: 'Sinistro', d: 'Consulte indícios e registros de sinistro quando disponíveis.' },
                { t: 'Recall', d: 'Verifique campanhas de recall aplicáveis.' },
                { t: 'Restrições', d: 'Identifique restrições e gravames quando disponíveis.' },
              ].map((c) => (
                <article key={c.t} className="info-card reveal">
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="funciona">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">Fácil, rápido e online</div>
              <h2 className="title">Consulte em 3 passos.</h2>
              <p className="sub">Sem complicação. Da placa ao relatório, um processo simples.</p>
            </div>
            <div className="steps">
              {[
                { n: '01', t: 'Digite a placa', d: 'Informe a placa do veículo que deseja consultar.' },
                { n: '02', t: 'Escolha a consulta', d: 'Selecione o nível de informação ideal para sua decisão.' },
                { n: '03', t: 'Receba o relatório', d: 'Visualize e receba o relatório por e-mail.' },
              ].map((s) => (
                <div key={s.n} className="step reveal">
                  <div className="n">{s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="planos">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">Planos de consulta</div>
              <h2 className="title">A consulta certa para o seu momento.</h2>
              <p className="sub">Escolha o nível de informação de que você precisa.</p>
            </div>
            <div className="plan-grid">
              {products.slice(0, 3).map((p, i) => (
                <article key={p.slug} className={`plan reveal ${i === 1 ? 'main' : ''}`}>
                  <div className="label">{i === 0 ? 'Para começar' : i === 1 ? 'Mais completa' : 'Consulta específica'}</div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <Link className={`btn ${i === 1 ? '' : 'btn-outline'}`} href={`/consultas/${p.slug}`}>Escolher {p.name} ↗</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="duvidas">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">Perguntas frequentes</div>
              <h2 className="title">Ainda tem dúvidas?</h2>
            </div>
            <div className="faq">
              {[
                { q: 'O que preciso para consultar um veículo?', a: 'Você pode iniciar informando a placa. Em seguida, escolha o serviço e complete os dados necessários.' },
                { q: 'É necessário pagar uma assinatura?', a: 'Há consultas avulsas com pagamento único. Verifique o tipo de consulta escolhido.' },
                { q: 'A consulta substitui uma vistoria cautelar?', a: 'Não. Consulta documental e avaliação física são complementares.' },
                { q: 'Todos os registros aparecem no relatório?', a: 'Não necessariamente. Os resultados dependem da cobertura, disponibilidade e atualização das bases utilizadas, além do plano contratado.' },
              ].map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final">
          <div className="container reveal">
            <h2>Antes de comprar, coloque o Olho no Doc.</h2>
            <p>Uma decisão importante merece mais do que boas fotos. Consulte a história do veículo e negocie com mais informação.</p>
            <Link href="#consulta" className="btn">Consultar placa agora ↗</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footerrow">
          <div>
            <img src="/logo-olho-no-doc.png" alt="Olho no Doc" />
            <p>Olho no Doc — Consulta veicular online.</p>
          </div>
          <nav>
            <Link href="/">Site oficial</Link>
            <Link href="/consultas">Consultas</Link>
            <Link href="/exemplo-relatorio">Relatório</Link>
          </nav>
        </div>
      </footer>

      <div className="mobileCTA">
        <Link className="btn" href="#consulta">Consultar minha placa ↗</Link>
      </div>
    </div>
  );
}
