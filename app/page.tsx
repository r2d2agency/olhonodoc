'use client';

import './landing.css';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((x) => {
        if (x.isIntersecting) {
          x.target.classList.add('on');
          obs.unobserve(x.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((x) => obs.observe(x));
    const plate = document.querySelector('#plate') as HTMLInputElement | null;
    const form = document.querySelector('#consulta') as HTMLFormElement | null;
    const hint = document.querySelector('#formhint');
    if (plate) {
      plate.addEventListener('input', () => {
        plate.value = plate.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
      });
    }
    if (form && plate) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!plate.checkValidity()) {
          plate.reportValidity();
          return;
        }
        if (hint) hint.textContent = `Placa ${plate.value} digitada. Continue a consulta no site oficial; a placa não será enviada automaticamente por esta prévia.`;
        window.location.href = '/consultas';
      });
    }
    return () => obs.disconnect();
  }, []);

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
                <p className="hint" id="formhint">Você será direcionado ao site oficial para escolher a consulta e prosseguir.</p>
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

        <div className="strip">
          <div className="container striprow">
            <span><b>✓</b> Leilão</span>
            <span><b>✓</b> Sinistro</span>
            <span><b>✓</b> Roubo e furto</span>
            <span><b>✓</b> Restrições</span>
            <span><b>✓</b> Recall</span>
          </div>
        </div>

        <section className="section soft" id="informacoes">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">O que você pode descobrir</div>
              <h2 className="title">Antes da chave, vem a informação.</h2>
              <p className="sub">Uma consulta reúne dados que ajudam você a avaliar um veículo com muito mais clareza. A disponibilidade varia conforme o plano e as bases consultadas.</p>
            </div>
            <div className="featuregrid">
              {[
                { n: '01 / HISTÓRICO', t: 'Passagem por leilão', d: 'Confira registros disponíveis sobre possível passagem por leilão antes de negociar.' },
                { n: '02 / OCORRÊNCIAS', t: 'Sinistro e roubo', d: 'Verifique informações disponíveis de sinistros, roubo e furto do veículo.' },
                { n: '03 / DOCUMENTOS', t: 'Restrições e gravame', d: 'Identifique possíveis apontamentos que merecem atenção na compra e transferência.' },
                { n: '04 / MANUTENÇÃO', t: 'Recall', d: 'Saiba se há informações sobre campanhas de recall do fabricante.' },
                { n: '05 / IDENTIFICAÇÃO', t: 'Dados cadastrais', d: 'Confira informações do veículo e compare com o documento apresentado.' },
                { n: '06 / DECISÃO', t: 'Valor e histórico', d: 'Tenha mais elementos para analisar a proposta e negociar com consciência.' },
              ].map((c) => (
                <article key={c.t} className="feature reveal">
                  <div className="num">{c.n}</div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container proof">
            <img className="reveal" src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=84" alt="Carro estacionado visto de lado" />
            <div className="reveal">
              <div className="eyebrow">A aparência não mostra tudo</div>
              <h2 className="title">Gostou do carro? Conheça a história antes de se apaixonar.</h2>
              <p className="sub">Uma pintura bonita e um bom test-drive não contam tudo sobre um veículo. O relatório ajuda a observar pontos que merecem atenção antes de assinar o contrato.</p>
              <div className="ticks">
                <div><b>✓</b> Mais segurança na negociação</div>
                <div><b>✓</b> Informações para avaliar o preço</div>
                <div><b>✓</b> Menos surpresas depois da compra</div>
              </div>
              <Link className="btn" href="#consulta" style={{ marginTop: 28 }}>Quero consultar agora ↗</Link>
            </div>
          </div>
        </section>

        <section className="reportwrap" id="relatorio">
          <div className="container reportgrid">
            <div className="reveal">
              <div className="eyebrow" style={{ color: '#99e8bb' }}>Entenda o resultado</div>
              <h2 className="title">Um relatório que ajuda você a decidir.</h2>
              <p className="sub">Informações organizadas em categorias para você identificar rapidamente o que exige atenção.</p>
              <Link className="btn btn-outline" href="/exemplo-relatorio">Ver exemplo de relatório ↗</Link>
            </div>
            <div className="preview reveal">
              <div className="previewtop">
                <img src="/logo-olho-no-doc.png" alt="Olho no Doc" />
                <small>PRÉVIA ILUSTRATIVA</small>
              </div>
              <h3>Placa ABC1D23</h3>
              <div className="stat"><span>Dados cadastrais</span><b>Conferidos</b></div>
              <div className="stat"><span>Passagem por leilão</span><b className="alert">Atenção</b></div>
              <div className="stat"><span>Roubo e furto</span><b>Nada consta</b></div>
              <div className="stat"><span>Restrições</span><b>Nada consta</b></div>
              <div className="stat"><span>Sinistro</span><b className="alert">Verificar</b></div>
              <div className="preview-note">Exemplo fictício, não corresponde a veículo real. Dados e abrangência dependem do produto e das fontes consultadas.</div>
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
                { n: '01', t: 'Informe a placa', d: 'Digite a placa do veículo que você deseja avaliar.' },
                { n: '02', t: 'Escolha a consulta', d: 'Selecione o tipo de relatório e faça o pagamento pelo site.' },
                { n: '03', t: 'Confira os dados', d: 'Analise as informações disponíveis antes de decidir.' },
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

        <section className="section soft" id="planos">
          <div className="container">
            <div className="center reveal">
              <div className="eyebrow">Planos de consulta</div>
              <h2 className="title">A consulta certa para o seu momento.</h2>
              <p className="sub">Escolha o nível de informação de que você precisa. Os valores e inclusões definitivos devem ser conferidos no checkout.</p>
            </div>
            <div className="plan-grid">
              <article className="plan reveal">
                <div className="label">Para começar</div>
                <h3>Essencial</h3>
                <p>As principais informações cadastrais e registros disponíveis para sua primeira avaliação.</p>
                <ul>
                  <li>Dados cadastrais</li>
                  <li>Roubo e furto</li>
                  <li>Identificação do veículo</li>
                </ul>
                <Link className="btn btn-outline" href="/consultas">Escolher Essencial ↗</Link>
              </article>
              <article className="plan main reveal">
                <div className="label">Mais completa</div>
                <h3>Premium</h3>
                <p>Uma visão mais ampla dos pontos que podem interferir na sua compra.</p>
                <ul>
                  <li>Dados cadastrais</li>
                  <li>Leilão e sinistro</li>
                  <li>Roubo e furto</li>
                  <li>Informações adicionais conforme plano</li>
                </ul>
                <Link className="btn" href="/consultas">Escolher Premium ↗</Link>
              </article>
              <article className="plan reveal">
                <div className="label">Consulta específica</div>
                <h3>Dados + roubo e furto</h3>
                <p>Uma verificação focada na identificação do veículo e nos registros disponíveis de roubo e furto.</p>
                <ul>
                  <li>Dados do veículo</li>
                  <li>Informações de roubo e furto</li>
                  <li>Consulta direcionada</li>
                </ul>
                <Link className="btn btn-outline" href="/consultas">Ver opções ↗</Link>
              </article>
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
                { q: 'O que preciso para consultar um veículo?', a: 'Você pode iniciar informando a placa. Em seguida, escolha o serviço e complete os dados necessários no site oficial.' },
                { q: 'É necessário pagar uma assinatura?', a: 'Há consultas avulsas com pagamento único. Verifique o tipo de consulta escolhido no site.' },
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
