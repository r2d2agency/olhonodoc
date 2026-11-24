export const GRAVAME_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consulta de Gravame</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--azul:#1e3a8a;--azul-claro:#2563eb;--texto:#111827;--texto-2:#374151;--muted:#6b7280;--borda:#d1d5db;--borda-2:#e5e7eb;--fundo-card:#f8fafc;--vermelho:#dc2626;--vermelho-bg:#fef2f2;--vermelho-borda:#fca5a5;--verde:#16a34a;--verde-bg:#f0fdf4;--verde-borda:#86efac;--verde-escuro:#166534}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',Arial,sans-serif;color:var(--texto);background:#fff;font-size:12px;line-height:1.45}
  .pagina{max-width:980px;margin:0 auto;padding:24px 16px 40px}
  .toolbar{display:flex;justify-content:flex-end;margin-bottom:12px}
  .btn-print{display:inline-flex;align-items:center;gap:8px;background:#1e3a8a;color:#fff;border:0;border-radius:8px;padding:10px 16px;font:700 12px Inter,sans-serif;cursor:pointer}
  .btn-print svg{width:16px;height:16px;fill:#fff}
  .cabecalho{display:flex;align-items:center;gap:18px;border-bottom:2px solid var(--borda-2);padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap}
  .cabecalho .logo{flex:1 1 100%;display:flex;justify-content:center}
  .cabecalho .logo img{height:72px;max-width:280px;display:block}
  .cabecalho .info{flex:1 1 auto;min-width:240px;font-size:11px;color:var(--texto-2);line-height:1.8}
  .cabecalho .info b{color:var(--texto)}
  .placa-mercosul{width:150px;border:2px solid #111;border-radius:8px;overflow:hidden;background:#eef2f5;flex:none}
  .placa-mercosul .topo{background:var(--azul);color:#fff;font-size:7px;font-weight:700;display:flex;justify-content:space-between;align-items:center;padding:2px 6px;height:16px}
  .placa-mercosul .topo .bandeira{width:12px;height:8px;background:#16a34a;position:relative}
  .placa-mercosul .topo .bandeira:after{content:"";position:absolute;inset:2px 3px;background:#facc15;border-radius:50%}
  .placa-mercosul .num{font-size:22px;font-weight:700;letter-spacing:4px;text-align:center;padding:2px 0 3px;font-family:'Courier New',monospace}
  .secao{border:1px solid var(--borda);border-radius:10px;overflow:hidden;margin-bottom:10px;break-inside:auto}
  .secao>.titulo{background:var(--azul);color:#fff;font-weight:700;font-size:12.5px;text-transform:uppercase;padding:12px 16px;display:flex;align-items:center;gap:10px}
  .secao>.titulo svg{width:16px;height:16px;fill:#fff;flex:none}
  .secao>.corpo{padding:16px}
  .campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}
  .campo{display:flex;justify-content:space-between;gap:10px;border-bottom:1px dotted var(--borda);padding-bottom:4px;min-width:0}
  .campo .l{font-weight:700;color:var(--texto);white-space:normal}
  .campo .v{color:var(--texto-2);text-align:right;overflow-wrap:anywhere}
  .status-box{display:inline-block;border:1px solid var(--verde-borda);background:var(--verde-bg);color:var(--verde-escuro);border-radius:8px;padding:12px 14px;font-weight:700}
  .status-box.alerta{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid var(--vermelho-borda);background:var(--vermelho-bg);color:var(--vermelho);text-align:center;width:118px;min-height:118px;padding:12px;text-transform:uppercase;font-size:11px;line-height:1.5;margin-bottom:14px}
  .status-box.alerta svg{width:28px;height:28px;fill:var(--vermelho)}
  .gravame-card{border:1px solid var(--borda);border-radius:8px;background:var(--fundo-card);padding:14px;margin-bottom:12px;break-inside:avoid}
  .gravame-card h3{font-size:12px;color:var(--azul);margin-bottom:10px;text-transform:uppercase}
  .spec-validacao{display:flex;align-items:center;justify-content:center;gap:14px;margin:18px 0;padding:14px;border:1px solid var(--verde-borda);border-radius:8px;background:var(--verde-bg)}
  .spec-validacao img{width:90px;height:90px;flex:none}
  .spec-validacao b{color:var(--verde-escuro);font-size:11px}
  .spec-validacao small{color:var(--texto-2);font-size:9px;overflow-wrap:anywhere;display:block}
  .spec-selos{display:flex;gap:12px;justify-content:center;margin:18px 0 8px;flex-wrap:wrap}
  .selo{border:2px solid var(--verde);color:var(--verde-escuro);font-weight:800;font-size:11px;padding:6px 14px;border-radius:20px}
  .spec-fim{text-align:center;font-weight:800;font-size:13px;margin:10px 0 16px;letter-spacing:1px}
  .avisos{border-top:1px solid var(--borda);margin-top:12px;padding-top:20px}
  .avisos h3{font-size:13px;text-transform:uppercase;margin-bottom:12px}
  .avisos p{color:var(--muted);text-align:justify;margin-bottom:10px;font-size:10.5px;line-height:1.6}
  @page{size:A4;margin:12mm 10mm}
  @media print{.toolbar{display:none}.pagina{max-width:none;padding:0}.secao{margin-bottom:6px}.secao>.corpo{padding:10px 12px}.gravame-card{padding:10px}}
</style>
</head>
<body>
<div class="pagina" id="relatorio"></div>
<script id="dados-consulta" type="application/json">__DATA__</script>
<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function campo(l,v){return '<div class="campo"><span class="l">'+esc(l)+':</span><span class="v">'+esc(v||'-')+'</span></div>'}
  function secao(titulo,corpo){return '<section class="secao"><div class="titulo">'+esc(titulo)+'</div><div class="corpo">'+corpo+'</div></section>'}
  function render(d){
    var h=[];
    // Cabeçalho enxuto: somente os dados do veículo presentes na consulta.
    h.push('<header class="cabecalho">'+
      (d.logoUrl?'<div class="logo"><img src="'+esc(d.logoUrl)+'" alt="Olho no Doc"></div>':'')+
      '<div class="info"><div><b>CONSULTA Nº:</b> '+esc(d.numero||'-')+'</div><div><b>CONFIDENCIAL PARA:</b> '+esc(d.cliente||'-')+'</div><div><b>REALIZADA EM:</b> '+esc(d.realizadaEm||'-')+'</div><div><b>Chassi:</b> '+esc(d.veiculo.chassi)+' &nbsp; <b>Renavam:</b> '+esc(d.veiculo.renavam)+'</div></div>'+
      '<div class="placa-mercosul"><div class="topo"><span>MERCOSUL</span><span>BRASIL</span><span class="bandeira"></span></div><div class="num">'+esc(d.veiculo.placa||'-')+'</div></div></header>');
    if(d.consta) h.push('<div class="status-box alerta"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span>RESTRIÇÃO<br>JUDICIAL!</span></div>');
    var g='';
    d.gravames.forEach(function(item,i){
      g+='<div class="gravame-card"><h3>Registro '+(i+1)+'</h3><div class="campos">'+item.map(function(p){return campo(p[0],p[1])}).join('')+'</div></div>';
    });
    h.push(secao('Histórico de Gravame',g));
    if(d.qrCode){h.push('<div class="spec-validacao"><img src="'+esc(d.qrCode)+'" alt="QR Code de validação"/><div><b>CONSULTA ORIGINAL E VALIDADA PELA OLHO NO DOC</b><small>Escaneie o QR Code para conferir a autenticidade.</small>'+(d.validationUrl?'<small>'+esc(d.validationUrl)+'</small>':'')+'</div></div>')}
    h.push('<div class="spec-selos"><span class="selo"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;vertical-align:middle"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg> QUALIDADE GARANTIDA</span><span class="selo"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;vertical-align:middle"><path d="M12 2a10 10 0 0 0-10 10v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6A10 10 0 0 0 12 2zm-1 13l-3-3 1.4-1.4 1.6 1.6 5.6-5.6L18 8l-7 7z"/></svg> SITE SEGURO</span></div><div class="spec-fim">FIM DESTA PESQUISA.</div>');
    h.push('<div class="avisos"><h3>Avisos legais</h3><p>As informações desta consulta são confidenciais e destinadas exclusivamente ao solicitante, para fins legítimos de análise, prevenção à fraude e verificação de procedência veicular.</p><p>A Olho no Doc reúne e transmite fielmente informações obtidas em bases públicas e privadas na data da consulta, não se responsabilizando por alterações posteriores realizadas pelos órgãos competentes.</p><p>As informações apresentadas possuem caráter exclusivamente informativo e auxiliar, não devendo ser consideradas como único fator decisivo para compra, venda, financiamento ou negociação.</p><p>Esta consulta não substitui a verificação direta junto aos órgãos oficiais e instituições financeiras.</p></div>');
    document.getElementById('relatorio').innerHTML=h.join('');
  }
  var dados=window.DADOS_CONSULTA;
  if(!dados){try{dados=JSON.parse(document.getElementById('dados-consulta').textContent)}catch(e){dados={}}}
  render(dados);
})();
</script>
</body>
</html>
`;
