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
  body{font-family:'Inter',Arial,sans-serif;color:var(--texto);background:#fff;font-size:12px;line-height:1.45}
  .pagina{max-width:980px;margin:0 auto;padding:24px 16px 40px}

  .toolbar{display:flex;justify-content:flex-end;gap:10px;margin-bottom:12px}
  .btn-print{display:inline-flex;align-items:center;gap:8px;background:#1e3a8a;color:#fff;border:0;border-radius:8px;padding:10px 16px;font:700 12px Inter,sans-serif;cursor:pointer}
  .btn-print:hover{background:#1d4ed8}
  .btn-print svg{width:16px;height:16px;fill:#fff}

  .banner-indisponivel{border:1px solid #f59e0b;background:#fffbeb;color:#92400e;border-radius:8px;padding:12px 14px;margin-bottom:12px;font-weight:600}

  /* Cabeçalho */
  .cabecalho{display:flex;align-items:center;gap:20px;padding-bottom:12px;border-bottom:2px solid var(--borda-2);margin-bottom:12px;flex-wrap:wrap}
  .cabecalho .logo img{height:72px;display:block}
  .cabecalho .info{flex:1;min-width:240px;font-size:12px;line-height:1.9}
  .cabecalho .info b{font-weight:700}
  .placa-mercosul{width:150px;border:2px solid #111;border-radius:8px;overflow:hidden;background:#eef2f5;flex:0 0 auto}
  .placa-mercosul .topo{background:var(--azul);color:#fff;font-size:7px;font-weight:700;display:flex;justify-content:space-between;align-items:center;padding:2px 6px;height:16px}
  .placa-mercosul .topo .bandeira{width:12px;height:8px;background:#16a34a;position:relative}
  .placa-mercosul .topo .bandeira::after{content:"";position:absolute;inset:2px 3px;background:#facc15;border-radius:50%}
  .placa-mercosul .num{font-size:22px;font-weight:700;letter-spacing:4px;text-align:center;padding:2px 0 3px;font-family:'Courier New',monospace}
  .modelo-carro{text-align:center;font-weight:800;font-size:11px;min-width:110px}
  .modelo-carro svg{width:40px;height:40px;fill:var(--vermelho)}

  /* Alertas topo */
  .alertas{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:12px}
  .alerta{border:1px solid var(--vermelho-borda);background:var(--vermelho-bg);border-radius:6px;min-height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10px 8px;color:var(--vermelho-escuro);font-weight:800;font-size:10.5px;text-transform:uppercase;gap:8px}
  .alerta svg{width:24px;height:24px}
  .alerta.atencao{background:var(--amarelo-bg);border:2px solid var(--amarelo-borda);color:#92400e}
  .alerta.ok{background:var(--verde-bg);border-color:var(--verde-borda);color:var(--verde-escuro)}

  /* Seções */
  .secao{border:1px solid var(--borda);border-radius:10px;overflow:hidden;margin-bottom:10px;break-inside:avoid-page}
  .secao>.titulo{background:var(--azul);color:#fff;font-weight:700;font-size:12.5px;text-transform:uppercase;padding:14px 16px;display:flex;align-items:center;gap:10px}
  .secao>.titulo svg{width:16px;height:16px;fill:#fff;flex:none}
  .secao>.titulo.teal{background:var(--teal)}
  .secao>.corpo{padding:18px 16px 14px}
  .secao.status{border-color:var(--verde-borda);background:var(--verde-bg)}
  .secao.status .titulo{background:transparent;color:var(--verde-escuro);padding:14px 14px}
  .secao.status .titulo svg{fill:var(--verde)}
  .secao.status.alerta-st{border-color:var(--vermelho-borda);background:var(--vermelho-bg)}
  .secao.status.alerta-st .titulo{color:var(--vermelho-escuro)}
  .secao.status.alerta-st .titulo svg{fill:var(--vermelho)}

  /* Campos - responsivo e sem corte */
  .campos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:20px;row-gap:10px}
  .campo{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px dotted var(--borda);padding-bottom:4px;min-width:0}
  .campo .l{font-weight:700;white-space:normal;flex:0 1 48%;overflow-wrap:anywhere}
  .campo .v{color:var(--texto-2);text-align:right;flex:1 1 52%;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}

  .bloco .l{font-weight:700;margin-bottom:4px}
  .bloco .v{color:var(--texto-2);border-bottom:1px dotted var(--borda);padding-bottom:4px;white-space:pre-wrap;overflow-wrap:anywhere}
  .bloco.curto .v{max-width:100%}

  .btn-laranja{display:inline-flex;align-items:center;gap:8px;background:var(--laranja);color:#fff;font-weight:800;font-size:10.5px;text-transform:uppercase;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px;border:0;cursor:pointer}
  .btn-laranja svg{width:14px;height:14px;fill:#fff}
  .nota{font-size:9px;color:var(--muted);margin-top:10px}
  .divisor{border:0;border-top:1px solid var(--borda-2);margin:14px 0 0}

  .subtitulo{font-weight:600;font-size:12px;padding-left:12px;border-left:3px solid var(--azul-claro);margin:0 0 10px}
  .registro{background:var(--fundo-card);border:1px solid var(--borda-2);border-radius:8px;padding:14px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px;row-gap:10px;margin-bottom:12px;break-inside:avoid}
  .registro .item .l{font-size:8.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
  .registro .item .v{font-size:10.5px;font-weight:700;text-transform:uppercase;min-height:14px;white-space:pre-wrap;overflow-wrap:anywhere}

  .status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:20px;row-gap:12px}
  .status-grid .full{grid-column:1/-1}
  .st-item .l{font-weight:700;margin-bottom:6px}
  .st-item{border-bottom:1px dotted var(--borda);padding-bottom:6px;min-width:0}
  .st-box{display:flex;align-items:flex-start;gap:10px;border:1px solid;border-radius:5px;padding:10px 14px}
  .st-box svg{width:14px;height:14px;flex:none;margin-top:2px}
  .st-box b{display:block;font-size:10.5px}
  .st-box span{font-size:9.5px;white-space:pre-wrap}
  .st-box.st-ok{background:var(--verde-bg);border-color:var(--verde-borda);color:var(--verde-escuro)}
  .st-box.st-ok svg{fill:var(--verde)}
  .st-box.st-alerta{background:var(--vermelho-bg);border-color:var(--vermelho-borda);color:var(--vermelho-escuro)}
  .st-box.st-alerta svg{fill:var(--vermelho)}
  .caixa-destaque{border:1px solid var(--borda-2);border-radius:10px;padding:14px;margin-bottom:14px}

  .destaque-positivo{border:1px solid var(--vermelho-borda);background:var(--vermelho-bg);color:var(--vermelho-escuro);border-radius:8px;padding:12px 14px;font-weight:700}
  .texto-formatado{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55;color:var(--texto-2)}

  table.comp{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}
  table.comp th{background:var(--fundo-card);text-align:left;font-weight:700;padding:10px 12px;border-bottom:1px solid var(--borda);border-right:1px solid var(--borda)}
  table.comp td{padding:12px;border-bottom:1px solid var(--borda);border-right:1px solid var(--borda);vertical-align:top;overflow-wrap:anywhere}
  table.comp th:last-child,table.comp td:last-child{text-align:center;border-right:0;width:110px}
  table.comp tr:last-child td{border-bottom:0}
  table.comp td:first-child{font-weight:600}
  /* Débitos e multas — tabela Descrição/Situação/Valor */
  table.debitos{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}
  table.debitos th{background:var(--fundo-card);text-align:left;font-weight:700;padding:10px 12px;border-bottom:1px solid var(--borda)}
  table.debitos td{padding:10px 12px;border-bottom:1px solid var(--borda-2);vertical-align:top;overflow-wrap:anywhere}
  table.debitos tr:last-child td{border-bottom:0}
  table.debitos td.sit-pendente{color:var(--vermelho-escuro);font-weight:800}
  table.debitos tr.linha-pendente{background:var(--vermelho-bg)}
  table.debitos td.valor{font-weight:700;text-align:right;white-space:nowrap}
  /* Histórico FIPE — indicadores + gráfico combinado SVG */
  .fipe-head{margin-bottom:12px}
  .fipe-head b{font-size:12.5px;display:block}
  .fipe-head span{color:var(--muted);font-size:10.5px}
  .fipe-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}
  .fipe-card{background:var(--fundo-card);border:1px solid var(--borda-2);border-radius:8px;padding:10px 12px}
  .fipe-card .fl{font-size:8.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
  .fipe-card .fv{font-size:13px;font-weight:800;color:var(--texto)}
  .fipe-card .fv.pos{color:var(--verde-escuro)}
  .fipe-card .fv.neg{color:var(--vermelho)}
  .fipe-legenda{display:flex;gap:16px;align-items:center;margin:8px 0 4px;font-size:10px;color:var(--texto-2)}
  .fipe-legenda i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:baseline}
  .ck{color:var(--verde);font-weight:800;font-size:15px}
  .x{color:var(--vermelho);font-weight:800;font-size:15px}
  .na{color:var(--muted);font-weight:800}

  .gauge-box{background:var(--fundo-card);border:1px solid var(--borda-2);border-radius:12px;padding:24px 10px 16px;text-align:center;margin-bottom:16px}
  .gauge-box svg{width:190px;height:110px}
  .gauge-box .nivel{font-weight:800;font-size:16px;margin-top:6px}
  .parecer-resumo{background:#fff;border:1px solid var(--borda-2);border-radius:10px;padding:14px 16px;margin-bottom:18px;color:var(--texto-2);line-height:1.6;white-space:pre-wrap}
  .legenda{background:#f5f8ff;border:1px solid #dbe4f3;border-radius:12px;padding:18px}
  .legenda>p{color:var(--texto-2);margin-bottom:14px;line-height:1.6}
  .nivel-card{background:#fff;border:1px solid var(--borda-2);border-radius:10px;padding:12px 14px 12px 44px;position:relative;margin-bottom:12px}
  .nivel-card::before{content:"";position:absolute;left:16px;top:16px;width:14px;height:14px;border-radius:50%;background:var(--cor)}
  .nivel-card h4{font-size:13px;margin-bottom:3px}
  .nivel-card p{color:var(--texto-2);line-height:1.55}
  .obs{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px 12px 44px;position:relative;color:#92400e}
  .obs::before{content:"!";position:absolute;left:16px;top:12px;font-size:14px;font-weight:800;color:#b45309;width:18px;height:18px;border:2px solid #f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center}
  .obs h4{font-size:13px;color:#92400e;margin-bottom:3px}

  .odometro{display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:12px}
  .odometro div{border-bottom:1px dotted var(--borda);padding-bottom:3px}
  .odometro b{font-weight:700}
  .odometro span{color:var(--muted)}

  .avisos{border-top:1px solid var(--borda);margin-top:12px;padding-top:24px}
  .avisos h3{font-size:13px;text-transform:uppercase;margin-bottom:14px;font-weight:700}
  .avisos p{color:var(--muted);text-align:justify;margin-bottom:12px;font-size:10.5px;line-height:1.65}

  .vazio{color:var(--muted);font-style:italic}

  @media screen and (max-width:900px){
    .campos{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @media screen and (max-width:720px){
    .alertas{grid-template-columns:repeat(2,1fr);gap:10px}
    .campos,.status-grid,.registro,.odometro{grid-template-columns:1fr}
    table.comp{table-layout:auto}
    table.comp th,table.comp td{padding:8px}
  }

  @page{size:A4;margin:12mm 10mm}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .pagina{max-width:none;padding:0;width:100%}
    .toolbar{display:none !important}
    .quebra{break-before:page}
    .registro,.secao{break-inside:avoid}
    .alertas{grid-template-columns:repeat(4,minmax(0,1fr)) !important}
    .campos{grid-template-columns:repeat(3,minmax(0,1fr)) !important}
    .registro{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    .status-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    .odometro{grid-template-columns:1fr 1fr !important}
    .fipe-cards{grid-template-columns:repeat(4,minmax(0,1fr)) !important}
    table.comp{table-layout:fixed}
  }
</style>
</head>
<body>
<div class="pagina" id="relatorio"></div>
<script id="dados-consulta" type="application/json">__DATA__</script>
<script>
(function () {
  var LOGO_PADRAO = "";
  var I = {
    carro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7zm2.2-1h9.6l-1-3H8.2l-1 3zM7.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7.7 11.3 3 3-1.4 1.4-3-3 1.4-1.4z"/></svg>',
    mapa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3l6 2 6-2v16l-6 2-6-2-6 2V5l6-2zm0 2.2L5 6.5v12.3l4-1.3V5.2zm2 0v12.3l4 1.3V6.5l-4-1.3zm6 1.3v12.3l2-.7V5.8l-2 .7z"/></svg>',
    id: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v10h16V7H4zm2 2h5v2H6V9zm0 4h5v2H6v-2zm8-4h4v6h-4V9z"/></svg>',
    dinheiro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v8h16V8H4zm8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>',
    cadeado: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1zm2 0h6V8a3 3 0 0 0-6 0v2zm-3 2v7h12v-7H6z"/></svg>',
    venda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l9-9h7v7l-9 9-7-7zm11-7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 3h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>',
    setas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-2.5-2.5L17 3l5 5-5 5-1.5-1.5L18 9H7V7zm10 10H6l2.5 2.5L7 21l-5-5 5-5 1.5 1.5L6 15h11v2z"/></svg>',
    recall: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm1 5h-2v6l5 3 1-1.7-4-2.3V7z"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4zm0 2.2L6 6.8V12c0 3.9 2.6 6.9 6 8 3.4-1.1 6-4.1 6-8V6.8l-6-2.6z"/></svg>',
    martelo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20l6-6 2 2-6 6H2v-2zm9.5-11.5l3-3 7 7-3 3-1-1-2 2-2-2 2-2-4-4z"/></svg>',
    paleta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 1 1 0-4h6a8 8 0 0 0-6-11zm-4 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4-2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>',
    triangulo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2L12 3zm0 4.5L5.5 19h13L12 7.5zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/></svg>',
    carrinho: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 4h2l2.2 10.4A2 2 0 0 0 9.2 16H17a2 2 0 0 0 1.9-1.4L21 7H6.3l-.4-2H3V4z"/></svg>',
    velocimetro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a9 9 0 0 0-7.7 13.6l1.7-1A7 7 0 1 1 19 14a7 7 0 0 1-1 3.6l1.7 1A9 9 0 0 0 12 5zm0 4 3 5-1.4 1.4L11 13l1-4z"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg>',
    erro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm3.5 13.1L13.4 13l2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4 2.1 2.1-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4z"/></svg>',
    seta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 16.6L13.2 12 8.6 7.4 10 6l6 6-6 6z"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6h1a3 3 0 0 1 3 3v5h-4v4H6v-4H2v-5a3 3 0 0 1 3-3h1zm2-4v4h8V5H8zm8 14v-4H8v4h8zm4-4v-2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2h2v-2h12v2h2z"/></svg>'
  };
  var ICONES_ALERTA = { sinistro: I.triangulo, leilao: I.martelo, info: I.info, roubo: I.escudo, judicial: I.martelo };

  function esc(v) { return String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function vazio(x) {
    if (x == null) return true;
    if (Array.isArray(x)) return x.length === 0;
    if (typeof x === "object") return Object.keys(x).length === 0;
    return String(x).trim() === "";
  }
  function textoOuVazio(v) { return vazio(v) ? '<span class="vazio">Não informado</span>' : '<div class="texto-formatado">' + esc(v) + '</div>'; }

  function secao(icone, titulo, corpo, opts) {
    opts = opts || {};
    var t = '<div class="titulo ' + (opts.teal ? "teal" : "") + '">' + (I[icone] || "") + '<span>' + esc(titulo) + '</span></div>';
    var cls = "secao " + (opts.classe || "");
    return '<section class="' + cls + '">' + t + '<div class="corpo" ' + (opts.semPadding ? 'style="padding:0"' : '') + '>' + corpo + '</div></section>';
  }

  function campos(lista) {
    if (!lista || !lista.length) return '<span class="vazio">Nenhuma informação disponível.</span>';
    return '<div class="campos">' + lista.map(function (p) {
      var label = Array.isArray(p) ? p[0] : (p.label || p.chave || "");
      var valor = Array.isArray(p) ? p[1] : (p.valor != null ? p.valor : "");
      return '<div class="campo"><span class="l">' + esc(label) + ':</span><span class="v">' + esc(valor) + '</span></div>';
    }).join("") + '</div>';
  }

  function registros(lista, subtitulo) {
    if (vazio(lista)) return "";
    return (subtitulo ? '<div class="subtitulo">' + esc(subtitulo) + '</div>' : "") +
      lista.map(function (r) {
        return '<div class="registro">' + Object.keys(r).map(function (k) {
          return '<div class="item"><div class="l">' + esc(k) + '</div><div class="v">' + esc(r[k]) + '</div></div>';
        }).join("") + '</div>';
      }).join("");
  }

  function stBox(s) {
    var ok = !s || s.status === "ok";
    var ic = ok ? I.ok : I.erro;
    var titulo = ok ? "Nada consta" : esc(s.titulo || "Alerta");
    var desc = ok ? " " : esc(s.descricao || " ");
    return '<div class="st-box ' + (ok ? "st-ok" : "st-alerta") + '">' + ic + '<div><b>' + titulo + '</b><span>' + desc + '</span></div></div>';
  }

  function stItem(rotulo, s, full) {
    var val = s && (s.valor || s.texto || s.titulo);
    var desc = (s && s.descricao) ? esc(s.descricao) : (val && s.status !== 'ok' ? esc(val) : (s && s.status === 'ok' && val ? esc(val) : ''));
    var box = '<div class="st-box ' + (s && s.status === "alerta" ? "st-alerta" : "st-ok") + '">' + ((s && s.status === "alerta") ? I.erro : I.ok) +
      '<div><b>' + ((s && s.status === "alerta") ? esc(s.titulo || "Consta registro") : "Nada consta") + '</b>' + (desc ? '<span>' + desc + '</span>' : '') + '</div></div>';
    return '<div class="st-item' + (full ? " full" : "") + '"><div class="l">' + esc(rotulo) + '</div>' + box + '</div>';
  }

  function faixaStatus(s) {
    if (!s) return "";
    var ok = s.status !== "alerta";
    var ic = ok ? I.ok : I.triangulo;
    var titulo = s.titulo || (ok ? "Nada consta" : "Alerta identificado");
    return '<section class="secao status ' + (ok ? "" : "alerta-st") + '"><div class="titulo">' + ic + '<span>' + esc(s.texto || "Status") + '</span></div>' +
      '<div class="corpo">' + stBox({ status: ok ? "ok" : "alerta", titulo: titulo, descricao: s.descricao || " " }) + '</div></section>';
  }

  function gauge(nivel) {
    var ang = { vermelho: -60, amarelo: 0, verde: 60 }[nivel];
    if (ang == null) ang = 0;
    var cor = { vermelho: "#dc2626", amarelo: "#f59e0b", verde: "#10b981" }[nivel] || "#6b7280";
    var rotulo = { vermelho: "VERMELHO - ALERTA", amarelo: "AMARELO - ATENÇÃO", verde: "VERDE - TUDO OK" }[nivel] || "EM ANÁLISE";
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

  function secaoFlexivel(icone, titulo, valor, opts) {
    if (vazio(valor)) return "";
    if (typeof valor === 'string') return secao(icone, titulo, textoOuVazio(valor), opts);
    if (Array.isArray(valor)) {
      // array of records or pairs
      if (valor.length && Array.isArray(valor[0])) return secao(icone, titulo, campos(valor), opts);
      return secao(icone, titulo, registros(valor), opts);
    }
    if (typeof valor === 'object') {
      var regs = registros([valor]);
      return secao(icone, titulo, regs || textoOuVazio(JSON.stringify(valor)), opts);
    }
    return secao(icone, titulo, textoOuVazio(String(valor)), opts);
  }

  function fmtBRL(n) {
    if (n == null || isNaN(n)) return "—";
    var neg = n < 0;
    var abs = Math.abs(n);
    var int = Math.floor(abs).toString();
    var dec = Math.round((abs - Math.floor(abs)) * 100).toString();
    if (dec.length < 2) dec = "0" + dec;
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "-R$ " : "R$ ") + int + "," + dec;
  }
  function fmtPct(n, sinal) {
    if (n == null || isNaN(n)) return "—";
    var txt = (sinal && n > 0 ? "+" : "") + String(n).replace(".", ",") + "%";
    return txt;
  }
  function fipeSecao(f) {
    if (vazio(f)) return "";
    if (typeof f === "string" || Array.isArray(f)) return secaoFlexivel("recall", "Histórico FIPE", f);
    // formato estruturado { marca, modelo, codigo, anoModelo, referencia, inicial, final, variacao_pct, variacao_nom, historico }
    var titulo = [f.marca, f.modelo].filter(Boolean).join(" ") || "Histórico FIPE";
    var sub = [f.codigo ? ("Tabela FIPE - Código " + f.codigo) : "", f.anoModelo ? ("Ano modelo " + f.anoModelo) : "", f.referencia ? ("Ref. " + f.referencia) : ""].filter(Boolean).join(" · ");
    var pctCls = (f.variacao_pct != null && f.variacao_pct < 0) ? "neg" : "pos";
    var corpo = '<div class="fipe-head"><b>' + esc(titulo) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div>' +
      '<div class="fipe-cards">' +
      '<div class="fipe-card"><div class="fl">Valor inicial</div><div class="fv">' + esc(fmtBRL(f.inicial)) + '</div></div>' +
      '<div class="fipe-card"><div class="fl">Valor final</div><div class="fv">' + esc(fmtBRL(f.final)) + '</div></div>' +
      '<div class="fipe-card"><div class="fl">Variação acumulada</div><div class="fv ' + pctCls + '">' + esc(fmtPct(f.variacao_pct, true)) + '</div></div>' +
      '<div class="fipe-card"><div class="fl">Variação em reais</div><div class="fv">' + esc(fmtBRL(f.variacao_nom)) + '</div></div>' +
      '</div>';
    var hist = f.historico || [];
    if (hist.length) {
      var W = 880, H = 300, PL = 52, PR = 40, PT = 14, PB = 46;
      var vals = hist.map(function (x) { return x.valor || 0; });
      var pcts = hist.map(function (x) { return x.variacao_pct; }).filter(function (x) { return x != null; });
      var maxV = Math.max.apply(null, vals.concat([0])) || 1;
      var minP = pcts.length ? Math.min.apply(null, pcts.concat([0])) : 0;
      var maxP = pcts.length ? Math.max.apply(null, pcts.concat([0])) : 0;
      if (minP === maxP) { minP -= 1; maxP += 1; }
      var n = hist.length;
      var slot = (W - PL - PR) / n;
      var bw = Math.min(34, slot * 0.52);
      var yV = function (v) { return PT + (H - PT - PB) * (1 - v / maxV); };
      var yP = function (p) { return PT + (H - PT - PB) * (1 - (p - minP) / (maxP - minP)); };
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block" role="img" aria-label="Histórico FIPE">';
      // grade + eixo esquerdo (R$)
      var steps = 5;
      for (var g = 0; g <= steps; g++) {
        var vv = maxV * g / steps;
        var yy = yV(vv);
        var lbl = vv >= 1000 ? ("R$ " + Math.round(vv / 100) / 10 + "k") : ("R$ " + Math.round(vv));
        s += '<line x1="' + PL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + yy.toFixed(1) + '" stroke="#e5e7eb" stroke-width="1"/>' +
             '<text x="' + (PL - 6) + '" y="' + (yy + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#6b7280">' + esc(lbl) + '</text>';
      }
      // linha zero do eixo % quando há negativos
      if (minP < 0) {
        var yz = yP(0);
        s += '<line x1="' + PL + '" y1="' + yz.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + yz.toFixed(1) + '" stroke="#9ca3af" stroke-width="1" stroke-dasharray="3,3"/>';
      }
      // barras
      hist.forEach(function (x, i) {
        var cx = PL + slot * i + slot / 2;
        var y = yV(x.valor || 0);
        var hgt = Math.max(2, (PT + (H - PT - PB)) - (y - PT) - 0);
        var y0 = PT + (H - PT - PB);
        s += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (y0 - y).toFixed(1) + '" rx="2" fill="#2563eb"/>';
        if (n <= 25 || i % Math.ceil(n / 20) === 0) {
          s += '<text x="' + cx.toFixed(1) + '" y="' + (H - PB + 14) + '" text-anchor="end" font-size="8.5" fill="#6b7280" transform="rotate(-38 ' + cx.toFixed(1) + ' ' + (H - PB + 14) + ')">' + esc(x.referencia) + '</text>';
        }
      });
      // linha de variação %
      if (pcts.length) {
        var pts = [];
        hist.forEach(function (x, i) {
          if (x.variacao_pct == null) return;
          var cx = PL + slot * i + slot / 2;
          pts.push([cx, yP(x.variacao_pct), x]);
        });
        var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
        s += '<path d="' + d + '" fill="none" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="4,3"/>';
        pts.forEach(function (p) {
          s += '<rect x="' + (p[0] - 3.5).toFixed(1) + '" y="' + (p[1] - 3.5).toFixed(1) + '" width="7" height="7" fill="#fff" stroke="#dc2626" stroke-width="1.4" transform="rotate(45 ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')"/>';
        });
        // rótulos % máx/mín
        var srt = pts.slice().sort(function (a, b) { return b[2].variacao_pct - a[2].variacao_pct; });
        if (srt.length) {
          var mx = srt[0], mn = srt[srt.length - 1];
          s += '<text x="' + (W - PR + 4) + '" y="' + mx[1].toFixed(1) + '" font-size="9" fill="#dc2626">' + esc(fmtPct(mx[2].variacao_pct, true)) + '</text>';
          if (mn !== mx) s += '<text x="' + (W - PR + 4) + '" y="' + (mn[1] + 3).toFixed(1) + '" font-size="9" fill="#dc2626">' + esc(fmtPct(mn[2].variacao_pct, true)) + '</text>';
        }
      }
      // eixo direito rótulo
      s += '<text x="' + (W - 4) + '" y="' + (PT + 2) + '" text-anchor="end" font-size="9" fill="#6b7280">%</text>';
      s += '</svg>';
      corpo += '<div class="fipe-legenda"><span><i style="background:#2563eb"></i>Valor FIPE</span><span><i style="background:#dc2626"></i>Variação anual</span></div>' + s;
    }
    return secao("recall", "Histórico FIPE", corpo, { classe: "quebra" });
  }

  function render(d) {
    var h = [];
    var c = d.consulta || {};

    h.push('<div class="toolbar"><button class="btn-print" onclick="window.print()">' + I.print + '<span>Imprimir / Salvar PDF</span></button></div>');

    if (c.indisponivel) {
      h.push('<div class="banner-indisponivel">Consulta com indisponibilidade/retorno parcial: ' + esc(c.indisponivel) + '</div>');
    }

    h.push('<header class="cabecalho">' +
      '<div class="logo">' + (c.logoUrl ? '<img src="' + esc(c.logoUrl) + '" alt="Logo">' : '') + '</div>' +
      '<div class="info"><div><b>CONSULTA Nº:</b> ' + esc(c.numero || '-') + '</div>' +
      '<div><b>PRODUTO:</b> ' + esc(c.produto || 'Auto Perícia Gold') + '</div>' +
      '<div><b>REALIZADA EM:</b> ' + esc(c.realizadaEm || '-') + '</div></div>' +
      '<div class="placa-mercosul"><div class="topo"><span>MERCOSUL</span><span>BRASIL</span><span class="bandeira"></span></div>' +
      '<div class="num">' + esc(c.placa || '-') + '</div></div>' +
      '<div class="modelo-carro">' + I.carro + '<div>' + esc(c.marcaModelo || '') + '</div></div>' +
      '</header>');

    if (!vazio(d.alertas)) {
      h.push('<div class="alertas">' + d.alertas.map(function (a) {
        var cls = a.tipo === "atencao" ? " atencao" : a.tipo === "ok" ? " ok" : "";
        return '<div class="alerta' + cls + '">' + (ICONES_ALERTA[a.icone] || ICONES_ALERTA.info) + '<span>' + esc(a.texto) + '</span></div>';
      }).join("") + '</div>');
    }

    if (!vazio(d.emplacamento)) h.push(secao("carro", "Dados de emplacamento do veículo", campos(d.emplacamento)));

    if (!vazio(d.baseBin)) {
      h.push(secao("lupa", "Base BIN", campos(d.baseBin)));
    } else if (d.baseBinStatus) {
      var st = /indispon/i.test(String(d.baseBinStatus)) ? {status:"alerta", titulo:"BIN indisponível", descricao:String(d.baseBinStatus)} : {status:"ok", titulo:"Informação", descricao:String(d.baseBinStatus)};
      h.push(secao("lupa", "Base BIN", '<div class="caixa-destaque">' + stBox(st.status === 'alerta' ? {status:'alerta', titulo: st.titulo, descricao: st.descricao} : {status:'ok'}) + '</div>' + (st.status === 'alerta' ? '' : textoOuVazio(d.baseBinStatus))));
    }

    if (!vazio(d.baseEstadual)) h.push(secao("mapa", "Base Estadual (dados atuais)", campos(d.baseEstadual)));

    if (d.proprietario) {
      h.push(secao("id", "Informações de proprietário",
        '<div class="bloco curto"><div class="l">Proprietário Atual</div><div class="v">' + esc(d.proprietario.atual) + '</div></div>'));
    }

    if (d.debitos) {
      var itens = d.debitos.itens || [];
      var corpoDeb = '';
      if (itens.length && typeof itens[0] === "object" && !Array.isArray(itens[0])) {
        // formato novo: [{descricao, situacao, valor, pendente}] — tabela com destaque de pendência
        corpoDeb = '<div style="overflow:auto"><table class="debitos"><thead><tr><th>Descrição</th><th>Situação</th><th style="text-align:right">Valor</th></tr></thead><tbody>' +
          itens.map(function (it) {
            var pend = it.pendente ? ' class="linha-pendente"' : '';
            return '<tr' + pend + '><td>' + esc(it.descricao) + '</td>' +
              '<td' + (it.pendente ? ' class="sit-pendente"' : '') + '>' + esc(it.situacao) + '</td>' +
              '<td class="valor">' + esc(it.valor) + '</td></tr>';
          }).join("") + '</tbody></table></div>';
      } else if (itens.length) {
        corpoDeb = campos(itens);
      } else if (d.debitos.multas || d.debitos.ipva) {
        corpoDeb = campos([["Multas", d.debitos.multas || "Nada consta"], ["IPVA", d.debitos.ipva || "Nada consta"]]);
      } else {
        corpoDeb = '<div class="caixa-destaque">' + stBox({status:"ok"}) + '</div>';
      }
      if (d.debitos.texto) corpoDeb += '<div class="nota">' + esc(d.debitos.texto) + '</div>';
      h.push(secao("dinheiro", "Débitos e multas", corpoDeb));
    }

    if (d.gravame !== undefined) {
      h.push(secao("cadeado", "Gravame", vazio(d.gravame) ? stBox({ status: "ok" }) : registros(d.gravame)));
    }

    if (!vazio(d.comunicacaoVenda)) {
      h.push(secao("venda", "Comunicação de venda",
        '<div class="bloco"><div class="l">Comunicação Ativa</div><div class="v">' + esc(d.comunicacaoVenda) + '</div></div>'));
    }

    if (!vazio(d.restricoes) || !vazio(d.restricoesTexto)) {
      var corpoR = '';
      if (!vazio(d.restricoes)) {
        corpoR += '<div class="status-grid">' + d.restricoes.map(function (r) { return stItem(r.rotulo, r, r.largura === "full"); }).join("") + '</div>';
      }
      if (!vazio(d.restricoesTexto)) {
        corpoR += '<div style="margin-top:14px"><div class="l" style="font-weight:700;margin-bottom:6px">Detalhamento</div>' + textoOuVazio(d.restricoesTexto) + '</div>';
      }
      if (!corpoR) corpoR = stBox({status:"ok"});
      h.push(secao("info", "Restrições e outras informações", corpoR));
    }

    if (!vazio(d.comparativo)) {
      var marca = { ok: '<span class="ck">✓</span>', diferente: '<span class="x">✕</span>', na: '<span class="na">—</span>' };
      h.push(secao("setas", "Comparativo de componentes veiculares",
        '<div style="overflow:auto"><table class="comp"><thead><tr><th>COMPONENTE</th><th>FÁBRICA</th><th>ESTADUAL</th><th>COMPARATIVO</th></tr></thead><tbody>' +
        d.comparativo.map(function (r) {
          return '<tr><td>' + esc(r.componente) + '</td><td>' + esc(r.fabrica) + '</td><td>' + esc(r.estadual) + '</td><td>' + (marca[r.status] || esc(r.comparativo || '—')) + '</td></tr>';
        }).join("") + '</tbody></table></div>', { semPadding: true }));
    }

    h.push(secaoFlexivel("info", "Informações complementares", d.informacoesComplementares));
    if (d.duplicidadeMotor && typeof d.duplicidadeMotor === "object" && !Array.isArray(d.duplicidadeMotor) && (d.duplicidadeMotor.texto || d.duplicidadeMotor.status)) {
      var dm = d.duplicidadeMotor;
      var dmCorpo = dm.status === "alerta"
        ? '<div class="caixa-destaque">' + stBox({ status: "alerta", titulo: dm.texto, descricao: " " }) + '</div>'
        : dm.status === "ok"
          ? '<div class="caixa-destaque"><div class="st-box st-ok">' + I.ok + '<div><b>' + esc(dm.texto) + '</b></div></div></div>'
          : '<div class="bloco"><div class="v">' + esc(dm.texto) + '</div></div>';
      h.push(secao("info", "Duplicidade de motor", dmCorpo));
    } else {
      h.push(secaoFlexivel("info", "Duplicidade de motor", d.duplicidadeMotor));
    }
    h.push(secaoFlexivel("info", "CSV", d.csv));
    h.push(secaoFlexivel("info", "Detalhamento no Renajud", d.detalhamentoRenajud));
    h.push(fipeSecao(d.historicoFipe));

    if (!vazio(d.recall)) {
      h.push(secao("recall", "Recall", '<div class="bloco"><div class="v">' + esc(d.recall) + '</div></div>'));
    }

    if (d.rouboFurto) {
      var rf = d.rouboFurto;
      var corpoRF = '<div class="caixa-destaque">' +
        stBox(rf.possuiHistorico ? { status: "alerta", titulo: rf.mensagem || "Veículo possui histórico de roubo e furto", descricao: " " } : { status: "ok", titulo: rf.mensagem || "Nada consta", descricao: " " }) +
        '</div>' + (vazio(rf.registros) ? "" : registros(rf.registros));
      h.push(secao("escudo", "Histórico de roubo e furto", corpoRF));
    }

    if (d.leilao !== undefined) {
      var corpoLeilao = vazio(d.leilao) ? (d.leilaoStatus ? '<div class="caixa-destaque">' + stBox({status:"alerta", titulo: d.leilaoStatus, descricao:" "}) + '</div>' : stBox({ status: "ok" })) : registros(d.leilao, "Registros");
      h.push(secao("martelo", "Leilão", corpoLeilao));
    }

    h.push(faixaStatus(d.vendaDireta));
    h.push(faixaStatus(d.eventoCorporativo));

    if (d.parecer) {
      var resumo = d.parecer.resumo ? '<div class="parecer-resumo"><strong>Resultado da análise:</strong><br>' + esc(d.parecer.resumo) + '</div>' : '';
      h.push(secao("paleta", "Parecer técnico",
        gauge(d.parecer.nivel) + resumo +
        '<div class="legenda">' +
        '<p>Essa informação indica uma estimativa de como o veículo tende a ser aceito pelas seguradoras, considerando os apontamentos identificados no histórico consultado. A análise não representa aprovação ou recusa definitiva de seguro.</p>' +
        '<div class="nivel-card" style="--cor:#10b981"><h4>Verde — Tudo ok / boa aceitação</h4><p>Não foram identificados apontamentos críticos relevantes na consulta realizada.</p></div>' +
        '<div class="nivel-card" style="--cor:#f59e0b"><h4>Amarelo — Atenção</h4><p>Há pontos que exigem análise cuidadosa, vistoria ou condições específicas junto à seguradora/comprador.</p></div>' +
        '<div class="nivel-card" style="--cor:#dc2626"><h4>Vermelho — Alerta</h4><p>Há apontamentos críticos que podem dificultar, limitar ou impedir a contratação de seguro e a negociação.</p></div>' +
        '<div class="obs"><h4>Observação importante</h4>O parecer é orientativo e considera os dados retornados na data/hora da consulta. A aprovação final depende da análise de cada instituição.</div>' +
        '</div>', { classe: "quebra" }));
    }

    if (d.sinistroCortesia) {
      h.push(secao("triangulo", "Informações de sinistro (cortesia)", '<div class="status-grid">' + stItem("Sinistro", d.sinistroCortesia, true) + '</div>'));
    }
    if (d.indicioSinistroCortesia) {
      h.push(secao("triangulo", "Indício de sinistro (cortesia)", '<div class="status-grid">' + stItem("Indício de Sinistro", d.indicioSinistroCortesia, true) + '</div>'));
    }

    if (d.comercializacao && (d.comercializacao.texto || d.comercializacao.destaque)) {
      var cBody = d.comercializacao.destaque
        ? '<div class="destaque-positivo">' + esc(d.comercializacao.texto || 'Consta histórico de comercialização') + '</div>'
        : '<div class="bloco"><div class="v">' + esc(d.comercializacao.texto) + '</div></div>';
      h.push(secao("carrinho", "Histórico de comercialização", cBody));
    } else if (!vazio(d.comercializacao)) {
      // compat string — qualquer histórico de comercialização fica em vermelho como alerta
      h.push(secao("carrinho", "Informações para comercialização", '<div class="destaque-positivo">' + esc(typeof d.comercializacao === "string" ? d.comercializacao : JSON.stringify(d.comercializacao)) + '</div>'));
    }

    if (!vazio(d.odometro)) {
      h.push(secao("velocimetro", "Histórico de odômetro",
        '<div class="odometro">' + d.odometro.map(function (o) {
          return '<div><b>' + esc(o.data) + '</b> <span>- ' + esc(o.km) + '</span></div>';
        }).join("") + '</div>', { teal: true }));
    }

    h.push('<div class="avisos"><h3>Avisos legais</h3>' +
      '<p>As informações contidas nesta consulta são confidenciais e destinadas exclusivamente ao solicitante da pesquisa, para fins legítimos de análise, prevenção à fraude, verificação de procedência veicular e apoio em negociações, sendo vedada sua utilização em desacordo com a legislação vigente.</p>' +
      '<p>A Olho no Doc limita-se a reunir, organizar e transmitir fielmente informações obtidas em bases públicas e privadas disponíveis na data e horário da consulta, não se responsabilizando por alterações posteriores realizadas pelos órgãos competentes ou entidades fornecedoras dos dados.</p>' +
      '<p>As informações apresentadas possuem caráter exclusivamente informativo e auxiliar, não devendo ser consideradas como único fator decisivo para compra, venda, financiamento, vistoria, transferência ou qualquer outra negociação.</p>' +
      '<p>Para veículos registrados em outros estados, podem existir restrições, débitos, bloqueios, sinistros, gravames ou demais apontamentos que somente constem no prontuário oficial no momento da efetiva transferência ou atualização cadastral.</p>' +
      '<p>Esta consulta não substitui a verificação direta junto aos órgãos oficiais, especialmente DETRAN, SENATRAN, instituições financeiras, seguradoras e demais entidades responsáveis.</p>' +
      '</div>');

    document.getElementById("relatorio").innerHTML = h.join("");
  }

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
