export const MODEL_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consulta Veicular Gold</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --azul:#1e3a8a; --azul-claro:#2563eb; --teal:#5b97a0;
    --texto:#111827; --texto-2:#374151; --muted:#6b7280; --borda:#d1d5db; --borda-2:#e5e7eb;
    --fundo-card:#f8fafc;
    --vermelho:#dc2626; --vermelho-bg:#fef2f2; --vermelho-borda:#fca5a5; --vermelho-escuro:#991b1b;
    --verde:#16a34a; --verde-bg:#f0fdf4; --verde-borda:#86efac; --verde-escuro:#166534;
    --amarelo-bg:#fef08a; --amarelo-borda:#eab308;
    --laranja:#f97316;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',Arial,sans-serif;color:var(--texto);background:#fff;font-size:12px;line-height:1.4}
  .pagina{max-width:900px;margin:0 auto;padding:24px 16px 40px}

  /* ===== Cabeçalho ===== */
  .cabecalho{display:flex;align-items:center;gap:20px;padding-bottom:12px;border-bottom:2px solid var(--borda-2);margin-bottom:12px;flex-wrap:wrap}
  .cabecalho .logo img{height:72px;display:block}
  .cabecalho .info{flex:1;min-width:240px;font-size:12px;line-height:1.9}
  .cabecalho .info b{font-weight:700}
  .placa-mercosul{width:150px;border:2px solid #111;border-radius:8px;overflow:hidden;background:#eef2f5}
  .placa-mercosul .topo{background:var(--azul);color:#fff;font-size:7px;font-weight:700;display:flex;justify-content:space-between;align-items:center;padding:2px 6px;height:16px}
  .placa-mercosul .topo .bandeira{width:12px;height:8px;background:#16a34a;position:relative}
  .placa-mercosul .topo .bandeira::after{content:"";position:absolute;inset:2px 3px;background:#facc15;border-radius:50%}
  .placa-mercosul .num{font-size:22px;font-weight:700;letter-spacing:4px;text-align:center;padding:2px 0 3px;font-family:'Courier New',monospace}
  .modelo-carro{text-align:center;font-weight:800;font-size:11px;min-width:110px}
  .modelo-carro svg{width:40px;height:40px;fill:var(--vermelho)}

  /* ===== Alertas topo ===== */
  .alertas{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:10px}
  .alerta{border:1px solid var(--vermelho-borda);background:var(--vermelho-bg);border-radius:6px;min-height:118px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10px 6px;color:var(--vermelho);font-weight:800;font-size:10.5px;text-transform:uppercase;gap:10px}
  .alerta svg{width:24px;height:24px}
  .alerta.atencao{background:var(--amarelo-bg);border:2px solid var(--amarelo-borda);color:#111}
  .alerta.ok{background:var(--verde-bg);border-color:var(--verde-borda);color:var(--verde-escuro)}

  /* ===== Seções ===== */
  .secao{border:1px solid var(--borda);border-radius:10px;overflow:hidden;margin-bottom:10px;break-inside:avoid-page}
  .secao>.titulo{background:var(--azul);color:#fff;font-weight:700;font-size:12.5px;text-transform:uppercase;padding:15px 16px;display:flex;align-items:center;gap:10px}
  .secao>.titulo svg{width:16px;height:16px;fill:#fff;flex:none}
  .secao>.titulo.teal{background:var(--teal)}
  .secao>.corpo{padding:22px 16px 14px}
  .secao.status{border-color:var(--verde-borda);background:var(--verde-bg)}
  .secao.status .titulo{background:transparent;color:var(--verde-escuro);padding:14px 14px}
  .secao.status .titulo svg{fill:var(--verde)}
  .secao.status.alerta-st{border-color:var(--vermelho-borda);background:var(--vermelho-bg)}
  .secao.status.alerta-st .titulo{color:var(--vermelho-escuro)}
  .secao.status.alerta-st .titulo svg{fill:var(--vermelho)}

  /* Grid de campos label: valor */
  .campos{display:grid;grid-template-columns:repeat(3,1fr);column-gap:24px;row-gap:12px}
  .campo{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px dotted var(--borda);padding-bottom:3px}
  .campo .l{font-weight:700;white-space:nowrap}
  .campo .v{color:var(--texto-2);text-align:right}

  /* Campo em bloco (rótulo em cima, valor embaixo) */
  .bloco .l{font-weight:700;margin-bottom:2px}
  .bloco .v{color:var(--texto-2);border-bottom:1px dotted var(--borda);padding-bottom:3px}
  .bloco.curto .v{max-width:300px}

  .btn-laranja{display:inline-flex;align-items:center;gap:8px;background:var(--laranja);color:#fff;font-weight:800;font-size:10.5px;text-transform:uppercase;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px}
  .btn-laranja svg{width:14px;height:14px;fill:#fff}
  .nota{font-size:8.5px;color:var(--muted);margin-top:10px}
  .divisor{border:0;border-top:1px solid var(--borda-2);margin:16px 0 0}

  /* Registros (gravame, roubo/furto, leilão) */
  .subtitulo{font-weight:600;font-size:12px;padding-left:12px;border-left:3px solid var(--azul-claro);margin:-6px 0 8px}
  .registro{background:var(--fundo-card);border:1px solid var(--borda-2);border-radius:8px;padding:14px;display:grid;grid-template-columns:1fr 1fr;column-gap:30px;row-gap:8px;margin-bottom:14px}
  .registro .item .l{font-size:8.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
  .registro .item .v{font-size:10.5px;font-weight:700;text-transform:uppercase;min-height:14px}

  /* Caixas de status (Nada consta / alerta) */
  .status-grid{display:grid;grid-template-columns:repeat(3,1fr);column-gap:24px;row-gap:14px}
  .status-grid .full{grid-column:1/-1}
  .st-item .l{font-weight:700;margin-bottom:6px}
  .st-item{border-bottom:1px dotted var(--borda);padding-bottom:6px}
  .st-box{display:flex;align-items:center;gap:10px;border:1px solid;border-radius:5px;padding:9px 14px}
  .st-box svg{width:14px;height:14px;flex:none}
  .st-box b{display:block;font-size:10.5px}
  .st-box span{font-size:9.5px}
  .st-box.st-ok{background:var(--verde-bg);border-color:var(--verde-borda);color:var(--verde-escuro)}
  .st-box.st-ok svg{fill:var(--verde)}
  .st-box.st-alerta{background:var(--vermelho-bg);border-color:var(--vermelho-borda);color:var(--vermelho-escuro)}
  .st-box.st-alerta svg{fill:var(--vermelho)}
  .caixa-destaque{border:1px solid var(--borda-2);border-radius:10px;padding:18px;margin-bottom:18px}
  .caixa-destaque .st-box{padding:14px 16px;font-weight:700;text-transform:uppercase}

  /* Tabela comparativa */
  table.comp{width:100%;border-collapse:collapse;font-size:11px}
  table.comp th{background:var(--fundo-card);text-align:left;font-weight:700;padding:12px 16px;border-bottom:1px solid var(--borda);border-right:1px solid var(--borda)}
  table.comp td{padding:14px 16px;border-bottom:1px solid var(--borda);border-right:1px solid var(--borda)}
  table.comp th:last-child,table.comp td:last-child{text-align:center;border-right:0}
  table.comp tr:last-child td{border-bottom:0}
  table.comp td:first-child{font-weight:600}
  .ck{color:var(--verde);font-weight:800;font-size:15px}
  .x{color:var(--vermelho);font-weight:800;font-size:15px}
  .na{color:var(--muted);font-weight:800}

  /* Parecer técnico */
  .gauge-box{background:var(--fundo-card);border:1px solid var(--borda-2);border-radius:12px;padding:30px 10px 20px;text-align:center;margin-bottom:24px}
  .gauge-box svg{width:190px;height:110px}
  .gauge-box .nivel{font-weight:800;font-size:16px;margin-top:6px}
  .legenda{background:#f5f8ff;border:1px solid #dbe4f3;border-radius:12px;padding:22px}
  .legenda>p{text-align:justify;color:var(--texto-2);padding-left:32px;position:relative;margin-bottom:18px;line-height:1.6}
  .legenda>p::before{content:"";position:absolute;left:0;top:2px;width:20px;height:20px;border-radius:50%;background:var(--azul-claro);box-shadow:inset 0 -7px 0 0 #fff}
  .nivel-card{background:#fff;border:1px solid var(--borda-2);border-radius:10px;padding:14px 16px 14px 48px;position:relative;margin-bottom:16px}
  .nivel-card::before{content:"";position:absolute;left:18px;top:20px;width:15px;height:15px;border-radius:50%;background:var(--cor)}
  .nivel-card h4{font-size:13px;margin-bottom:3px}
  .nivel-card p{color:var(--texto-2);text-align:justify;line-height:1.6}
  .obs{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px 14px 48px;position:relative;color:#b45309}
  .obs::before{content:"⚠";position:absolute;left:18px;top:16px;font-size:17px;color:#f59e0b}
  .obs h4{font-size:13px;color:#92400e;margin-bottom:3px}

  /* Odômetro */
  .odometro{display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:16px}
  .odometro div{border-bottom:1px dotted var(--borda);padding-bottom:3px}
  .odometro b{font-weight:700}
  .odometro span{color:var(--muted)}

  /* Avisos legais */
  .avisos{border-top:1px solid var(--borda);margin-top:12px;padding-top:24px}
  .avisos h3{font-size:13px;text-transform:uppercase;display:flex;align-items:center;gap:10px;margin-bottom:18px;font-weight:700}
  .avisos h3::before{content:"";width:20px;height:20px;border-radius:50%;background:var(--azul);box-shadow:inset 0 -7px 0 0 #fff}
  .avisos p{color:var(--muted);text-align:justify;margin-bottom:14px;font-size:10.5px;line-height:1.65}

  .vazio{color:var(--muted);font-style:italic}

  /* ===== Responsivo ===== */
  @media (max-width:720px){
    .alertas{grid-template-columns:repeat(2,1fr);gap:10px}
    .campos,.status-grid{grid-template-columns:1fr}
    .registro,.odometro{grid-template-columns:1fr}
    table.comp th,table.comp td{padding:10px 8px}
  }

  /* ===== Impressão / PDF (A4) ===== */
  @page{size:A4;margin:12mm 10mm}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .pagina{max-width:none;padding:0}
    .quebra{break-before:page}
    .registro{break-inside:avoid}
    .btn-laranja{text-decoration:none}
  }
</style>
</head>
<body>
<div class="pagina" id="relatorio"></div>

<!--
  =====================================================================
  DADOS DA CONSULTA
  ---------------------------------------------------------------------
  Seu sistema só precisa preencher este JSON (ou definir
  window.DADOS_CONSULTA antes do script de renderização).
  Seções vazias/ausentes são ocultadas automaticamente.

  status das caixas: "ok" (verde / nada consta) | "alerta" (vermelho)
  alertas do topo:   "alerta" (vermelho) | "atencao" (amarelo) | "ok" (verde)
  parecer.nivel:     "verde" | "amarelo" | "vermelho"
  comparativo.status:"ok" | "diferente" | "na"
  =====================================================================
-->
<script type="application/json" id="dados-consulta">
__DATA__
</script>

<script>
(function () {
  "use strict";

  var LOGO_PADRAO = "data:image/png;base64,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";

  /* ---------- Ícones (SVG inline) ---------- */
  var I = {
    carro:'<svg viewBox="0 0 24 24"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v5h-2v2h-3v-2H8v2H5v-2H3v-5a2 2 0 0 1 2-2zm2.2 0h9.6l-1-3.2a1 1 0 0 0-1-.8H9.2a1 1 0 0 0-1 .8zM7 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>',
    lupa:'<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5 5-1.4 1.4-5-5A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
    mapa:'<svg viewBox="0 0 24 24"><path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zm7 .3v12.4l4 1.3V6.6z"/></svg>',
    id:'<svg viewBox="0 0 24 24"><path d="M9 2h6v4H9zM3 5h4v3h10V5h4v16H3zm6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 8h6a3 3 0 0 0-6 0zm8-7v2h4v-2zm0 4v2h4v-2z"/></svg>',
    dinheiro:'<svg viewBox="0 0 24 24"><path d="M2 5h18v12H2zm9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM22 8v11H5v-2h15V8z"/></svg>',
    cadeado:'<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h2v12H5V10zm2 0h6V7a3 3 0 0 0-6 0zm3 4a1.5 1.5 0 0 0-1 2.6V19h2v-2.4a1.5 1.5 0 0 0-1-2.6z"/></svg>',
    venda:'<svg viewBox="0 0 24 24"><path d="M4 3h16v18H4zm8 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm-4.5 10h9a4.5 4.5 0 0 0-9 0z"/></svg>',
    info:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 8v7h2v-7zm0-4v2h2V6z"/></svg>',
    setas:'<svg viewBox="0 0 24 24"><path d="M16 4l4 4-4 4V9h-6V7h6zM8 12v3h6v2H8v3l-4-4z"/></svg>',
    recall:'<svg viewBox="0 0 24 24"><path d="M3 3h18v14H7l-4 4zm8 3v6h2V6zm0 7v2h2v-2z"/></svg>',
    escudo:'<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5zm0 5.5l-1.2 2.6-2.8.3 2.1 1.9-.6 2.8 2.5-1.5 2.5 1.5-.6-2.8 2.1-1.9-2.8-.3z"/></svg>',
    martelo:'<svg viewBox="0 0 24 24"><path d="M13.8 2.3l5.7 5.7-2.1 2.1-1.4-1.4-2.8 2.8 6.4 6.4-1.4 1.4-6.4-6.4-2.8 2.8 1.4 1.4-2.1 2.1L2.6 13.5l2.1-2.1 1.4 1.4 5.6-5.6-1.4-1.4zM2 20h10v2H2z"/></svg>',
    paleta:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5.6 5.6 0 0 0 22 9.8C22 5.5 17.5 2 12 2zM6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>',
    triangulo:'<svg viewBox="0 0 24 24"><path d="M12 2l11 20H1zm-1 7v6h2V9zm0 8v2h2v-2z"/></svg>',
    carrinho:'<svg viewBox="0 0 24 24"><path d="M2 3h3.3l.9 2H21l-3.4 8H8.1l-.9 2H19v2H4l2.2-4.4L3.7 5H2zm6 16a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>',
    velocimetro:'<svg viewBox="0 0 24 24"><path d="M12 3a10 10 0 0 1 8.7 15H3.3A10 10 0 0 1 12 3zm0 2a8 8 0 0 0-7.4 11h14.8A8 8 0 0 0 12 5zm4.2 2.4l1.4 1.4-4.2 4.2a1.6 1.6 0 1 1-1.4-1.4z"/></svg>',
    ok:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm4.3 6.3L10.5 14l-2.8-2.8-1.4 1.4 4.2 4.2 7.2-7.2z"/></svg>',
    erro:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-3.3 5.3L7.3 8.7 10.6 12l-3.3 3.3 1.4 1.4 3.3-3.3 3.3 3.3 1.4-1.4-3.3-3.3 3.3-3.3-1.4-1.4-3.3 3.3z"/></svg>',
    seta:'<svg viewBox="0 0 24 24"><path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z"/></svg>'
  };
  var ICONES_ALERTA = {
    sinistro:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l11 20H1zm-1 7v6h2V9zm0 8v2h2v-2z"/></svg>',
    leilao:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.8 2.3l5.7 5.7-2.1 2.1-1.4-1.4-2.8 2.8 6.4 6.4-1.4 1.4-6.4-6.4-2.8 2.8 1.4 1.4-2.1 2.1L2.6 13.5l2.1-2.1 1.4 1.4 5.6-5.6-1.4-1.4zM2 20h10v2H2z"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 5v7h2V7zm0 9v2h2v-2z"/></svg>',
    roubo:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5zm0 5.5l-1.2 2.6-2.8.3 2.1 1.9-.6 2.8 2.5-1.5 2.5 1.5-.6-2.8 2.1-1.9-2.8-.3z"/></svg>',
    judicial:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16v1.5" stroke-linecap="round"/></svg>',
    ok:I.ok.replace('<svg ','<svg fill="currentColor" ')
  };

  /* ---------- Utilitários ---------- */
  function esc(v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function vazio(x) {
    return x === undefined || x === null || x === "" || (Array.isArray(x) && x.length === 0);
  }
  function secao(icone, titulo, corpo, opts) {
    opts = opts || {};
    return '<section class="secao' + (opts.classe ? " " + opts.classe : "") + '">' +
      '<div class="titulo' + (opts.teal ? " teal" : "") + '">' + (I[icone] || "") + esc(titulo) + '</div>' +
      (opts.semPadding ? corpo : '<div class="corpo">' + corpo + '</div>') +
      '</section>';
  }
  function campos(lista) {
    return '<div class="campos">' + lista.map(function (p) {
      return '<div class="campo"><span class="l">' + esc(p[0]) + ':</span><span class="v">' + esc(p[1]) + '</span></div>';
    }).join("") + '</div>';
  }
  function registros(lista, subtitulo) {
    return '<div class="subtitulo">' + esc(subtitulo || "Histórico de Registros") + '</div>' +
      lista.map(function (r) {
        return '<div class="registro">' + Object.keys(r).map(function (k) {
          return '<div class="item"><div class="l">' + esc(k) + '</div><div class="v">' + esc(r[k]) + '</div></div>';
        }).join("") + '</div>';
      }).join("");
  }
  function stBox(s) {
    var ok = !s || s.status !== "alerta";
    var titulo = s && s.titulo ? s.titulo : (ok ? "Nada Consta" : "Consta");
    var desc = s && s.descricao ? s.descricao : (ok ? "Nenhum registro encontrado nas bases consultadas." : "");
    return '<div class="st-box ' + (ok ? "st-ok" : "st-alerta") + '">' + (ok ? I.ok : I.erro) +
      '<div><b>' + esc(titulo) + '</b>' + (desc ? '<span>' + esc(desc) + '</span>' : "") + '</div></div>';
  }
  function stItem(rotulo, s, full) {
    return '<div class="st-item' + (full ? " full" : "") + '"><div class="l">' + esc(rotulo) + '</div>' + stBox(s) + '</div>';
  }
  function faixaStatus(s) {
    if (!s) return "";
    var ok = s.status !== "alerta";
    return '<section class="secao status' + (ok ? "" : " alerta-st") + '"><div class="titulo">' + (ok ? I.ok : I.erro) + esc(s.texto) + '</div></section>';
  }
  function gauge(nivel) {
    // ângulo do ponteiro: vermelho = esquerda, amarelo = centro, verde = direita
    var ang = { vermelho: -60, amarelo: 0, verde: 60 }[nivel] ?? -60;
    var cor = { vermelho: "#dc2626", amarelo: "#f59e0b", verde: "#10b981" }[nivel] || "#dc2626";
    var rotulo = { vermelho: "VERMELHO", amarelo: "AMARELO", verde: "VERDE" }[nivel] || esc(nivel).toUpperCase();
    function arco(a1, a2, c) {
      var r = 80, cx = 100, cy = 100;
      var p = function (a) { var t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; };
      var s = p(a1), e = p(a2);
      return '<path d="M' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 0 1 ' + e[0] + ' ' + e[1] + '" stroke="' + c + '" stroke-width="16" fill="none"/>';
    }
    return '<div class="gauge-box"><svg viewBox="0 0 200 110">' +
      '<path d="M12 100 A88 88 0 0 1 188 100" stroke="#e5e7eb" stroke-width="4" fill="none"/>' +
      arco(-90, -32, "#ef4444") + arco(-30, 18, "#f59e0b") + arco(20, 90, "#10b981") +
      '<g transform="rotate(' + ang + ' 100 100)"><line x1="100" y1="100" x2="100" y2="38" stroke="#111827" stroke-width="5" stroke-linecap="round"/></g>' +
      '<circle cx="100" cy="100" r="9" fill="#111827"/></svg>' +
      '<div class="nivel" style="color:' + cor + '">' + rotulo + '</div></div>';
  }

  /* ---------- Renderização ---------- */
  function render(d) {
    var h = [];
    var c = d.consulta || {};

    // Cabeçalho
    h.push('<header class="cabecalho">' +
      '<div class="logo"><img src="' + esc(c.logoUrl || LOGO_PADRAO) + '" alt="Logo"></div>' +
      '<div class="info"><div><b>CONSULTA Nº:</b> ' + esc(c.numero) + '</div>' +
      '<div><b>PRODUTO:</b> ' + esc(c.produto) + '</div>' +
      '<div><b>REALIZADA EM:</b> ' + esc(c.realizadaEm) + '</div></div>' +
      '<div class="placa-mercosul"><div class="topo"><span>MERCOSUL</span><span>BRASIL</span><span class="bandeira"></span></div>' +
      '<div class="num">' + esc(c.placa) + '</div></div>' +
      '<div class="modelo-carro">' + I.carro + '<div>' + esc(c.marcaModelo) + '</div></div>' +
      '</header>');

    // Alertas
    if (!vazio(d.alertas)) {
      h.push('<div class="alertas">' + d.alertas.map(function (a) {
        var cls = a.tipo === "atencao" ? " atencao" : a.tipo === "ok" ? " ok" : "";
        return '<div class="alerta' + cls + '">' + (ICONES_ALERTA[a.icone] || ICONES_ALERTA.info) + '<span>' + esc(a.texto) + '</span></div>';
      }).join("") + '</div>');
    }

    if (!vazio(d.emplacamento)) h.push(secao("carro", "Dados de emplacamento do veículo", campos(d.emplacamento)));
    if (!vazio(d.baseBin)) h.push(secao("lupa", "Base BIN", campos(d.baseBin)));
    if (!vazio(d.baseEstadual)) h.push(secao("mapa", "Base Estadual (dados atuais)", campos(d.baseEstadual)));

    if (d.proprietario) {
      h.push(secao("id", "Informações de proprietário",
        '<div class="bloco curto"><div class="l">Proprietário Atual</div><div class="v">' + esc(d.proprietario.atual) + '</div></div>'));
    }

    if (d.debitos) {
      var db = d.debitos;
      h.push(secao("dinheiro", "Débitos e multas",
        '<div class="bloco"><div class="l">Multas</div><div class="v">' + esc(db.multas) + '</div></div>' +
        '<hr class="divisor">' +
        (db.botaoLink ? '<a class="btn-laranja" href="' + esc(db.botaoLink) + '" target="_blank" rel="noopener">' + I.dinheiro + esc(db.botaoTexto || "Regularizar débitos") + I.seta + '</a>' : "") +
        (db.nota ? '<div class="nota">' + esc(db.nota) + '</div>' : "")));
    }

    if (d.gravame !== undefined) {
      h.push(secao("cadeado", "Gravame", vazio(d.gravame) ? stBox({ status: "ok" }) : registros(d.gravame)));
    }

    if (!vazio(d.comunicacaoVenda)) {
      h.push(secao("venda", "Comunicação de venda",
        '<div class="bloco"><div class="l">Comunicação Ativa</div><div class="v">' + esc(d.comunicacaoVenda) + '</div></div>'));
    }

    if (!vazio(d.restricoes)) {
      h.push(secao("info", "Restrições e outras informações",
        '<div class="status-grid">' + d.restricoes.map(function (r) { return stItem(r.rotulo, r, r.largura === "full"); }).join("") + '</div>'));
    }

    if (!vazio(d.comparativo)) {
      var marca = { ok: '<span class="ck">✓</span>', diferente: '<span class="x">✕</span>', na: '<span class="na">—</span>' };
      h.push(secao("setas", "Comparativo de componentes veiculares",
        '<table class="comp"><thead><tr><th>COMPONENTE</th><th>FÁBRICA</th><th>ESTADUAL</th><th>COMPARATIVO</th></tr></thead><tbody>' +
        d.comparativo.map(function (r) {
          return '<tr><td>' + esc(r.componente) + '</td><td>' + esc(r.fabrica) + '</td><td>' + esc(r.estadual) + '</td><td>' + (marca[r.status] || marca.na) + '</td></tr>';
        }).join("") + '</tbody></table>', { semPadding: true }));
    }

    if (!vazio(d.recall)) {
      h.push(secao("recall", "Recall", '<div class="bloco"><div class="v" style="color:var(--texto-2)">' + esc(d.recall) + '</div></div>'));
    }

    if (d.rouboFurto) {
      var rf = d.rouboFurto;
      var corpoRF = '<div class="caixa-destaque">' +
        stBox(rf.possuiHistorico ? { status: "alerta", titulo: rf.mensagem || "VEÍCULO POSSUI HISTÓRICO DE ROUBO E FURTO", descricao: " " } : { status: "ok" }) +
        '</div>' + (vazio(rf.registros) ? "" : registros(rf.registros));
      h.push(secao("escudo", "Queixa e histórico de roubo e furto", corpoRF));
    }

    if (d.leilao !== undefined) {
      h.push(secao("martelo", "Leilão", vazio(d.leilao) ? stBox({ status: "ok" }) : registros(d.leilao, "Registros")));
    }

    h.push(faixaStatus(d.vendaDireta));
    h.push(faixaStatus(d.eventoCorporativo));

    if (d.parecer) {
      h.push(secao("paleta", "Parecer técnico (cortesia)",
        gauge(d.parecer.nivel) +
        '<div class="legenda">' +
        '<p>Essa informação indica uma estimativa de como o veículo tende a ser aceito pelas seguradoras, considerando possíveis apontamentos no histórico do veículo. Essa análise não representa aprovação ou recusa definitiva de seguro, pois cada seguradora possui critérios próprios de avaliação.</p>' +
        '<div class="nivel-card" style="--cor:#10b981"><h4>Verde — Boa aceitação</h4><p>Indica que o veículo apresenta uma boa tendência de aceitação no mercado securitário. Normalmente, não foram identificados apontamentos relevantes que possam dificultar a contratação do seguro.</p></div>' +
        '<div class="nivel-card" style="--cor:#f59e0b"><h4>Amarelo/Laranja — Aceitação com atenção</h4><p>Indica que o veículo pode apresentar algum fator que exige maior análise por parte das seguradoras. A contratação do seguro pode ser possível, mas pode depender de vistoria, análise complementar, restrições de cobertura ou condições específicas.</p></div>' +
        '<div class="nivel-card" style="--cor:#ef4444"><h4>Vermelho — Baixa aceitação</h4><p>Indica que o veículo possui maior possibilidade de restrição no mercado securitário. Algumas seguradoras podem dificultar, limitar ou até recusar a contratação do seguro, dependendo dos apontamentos encontrados no histórico do veículo.</p></div>' +
        '<div class="obs"><h4>Observação importante:</h4>A média de aceitação no mercado securitário é apenas uma informação orientativa. A aprovação final do seguro depende exclusivamente da análise de cada seguradora.</div>' +
        '</div>', { classe: "quebra" }));
    }

    if (d.sinistroCortesia) {
      h.push(secao("triangulo", "Informações de sinistro (cortesia)", '<div class="status-grid">' + stItem("Sinistro", d.sinistroCortesia, true) + '</div>'));
    }
    if (d.indicioSinistroCortesia) {
      h.push(secao("triangulo", "Indício de sinistro (cortesia)", '<div class="status-grid">' + stItem("Indício de Sinistro", d.indicioSinistroCortesia, true) + '</div>'));
    }
    if (!vazio(d.comercializacao)) {
      h.push(secao("carrinho", "Informações para comercialização", '<div class="bloco"><div class="v">' + esc(d.comercializacao) + '</div></div>'));
    }
    if (!vazio(d.odometro)) {
      h.push(secao("velocimetro", "Histórico de odômetro",
        '<div class="odometro">' + d.odometro.map(function (o) {
          return '<div><b>' + esc(o.data) + '</b> <span>- ' + esc(o.km) + '</span></div>';
        }).join("") + '</div>', { teal: true }));
    }

    // Avisos legais
    h.push('<div class="avisos"><h3>Avisos legais</h3>' +
      '<p>As informações contidas nesta consulta são confidenciais e destinadas exclusivamente ao solicitante da pesquisa, para fins legítimos de análise, prevenção à fraude, verificação de procedência veicular e apoio em negociações particulares ou comerciais, sendo vedada sua utilização em desacordo com a legislação vigente, sob pena de responsabilidade civil, administrativa e criminal.</p>' +
      '<p>A Olho no Doc limita-se a reunir, organizar e transmitir fielmente informações obtidas em bases públicas e privadas disponíveis na data e horário da consulta, não se responsabilizando por alterações, inclusões, exclusões ou atualizações realizadas posteriormente pelos órgãos competentes ou entidades fornecedoras dos dados.</p>' +
      '<p>As informações apresentadas possuem caráter exclusivamente informativo e auxiliar, servindo como ferramenta de apoio na avaliação da situação e procedência do veículo, não devendo ser consideradas como único fator decisivo para compra, venda, financiamento, vistoria, transferência ou qualquer outra negociação.</p>' +
      '<p>Para veículos registrados em outros estados, podem existir restrições, débitos, bloqueios, sinistros, gravames ou demais apontamentos que somente constem no prontuário oficial no momento da efetiva transferência ou atualização cadastral junto ao órgão competente.</p>' +
      '<p>Esta consulta não substitui a verificação direta junto aos órgãos oficiais, especialmente DETRAN, SENATRAN, instituições financeiras, seguradoras e demais entidades responsáveis, uma vez que os dados podem sofrer alterações em tempo real.</p>' +
      '</div>');

    document.getElementById("relatorio").innerHTML = h.join("");
  }

  // Expõe para o sistema poder re-renderizar com outros dados: renderConsulta(objeto)
  window.renderConsulta = render;

  var dados = window.DADOS_CONSULTA;
  if (!dados) {
    try { dados = JSON.parse(document.getElementById("dados-consulta").textContent); }
    catch (e) { console.error("JSON da consulta inválido:", e); dados = {}; }
  }
  render(dados);
})();
</script>
</body>
</html>
`;
