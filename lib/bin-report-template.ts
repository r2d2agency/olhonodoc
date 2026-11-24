export const BIN_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consulta Base BIN + RF</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{--azul:#0b3552;--azul-claro:#2563eb;--texto:#111827;--texto-2:#374151;--muted:#6b7280;--borda:#d1d5db;--borda-2:#e5e7eb;--fundo-card:#f8fafc;--vermelho:#dc2626;--vermelho-bg:#fef2f2;--vermelho-borda:#fca5a5;--verde:#16a34a;--verde-bg:#f0fdf4;--verde-borda:#86efac;--verde-escuro:#166534}
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
  .selos{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
  .selo-alerta{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100px;min-height:100px;border:1px solid var(--vermelho-borda);border-radius:8px;background:var(--vermelho-bg);color:var(--vermelho);text-align:center;font-weight:800;font-size:9.5px;line-height:1.35;text-transform:uppercase;padding:8px}
  .selo-alerta svg{width:26px;height:26px;fill:var(--vermelho)}
  .secao{border:1px solid var(--borda);border-radius:10px;overflow:hidden;margin-bottom:10px;break-inside:auto}
  .secao>.titulo{background:var(--azul);color:#fff;font-weight:700;font-size:12.5px;text-transform:none;padding:12px 16px;display:flex;align-items:center;gap:10px}
  .secao>.titulo svg{width:16px;height:16px;fill:#fff;flex:none}
  .secao>.corpo{padding:16px}
  .campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 18px}
  .campo{display:flex;justify-content:space-between;gap:10px;border-bottom:1px dotted var(--borda);padding-bottom:4px;min-width:0}
  .campo .l{font-weight:700;color:var(--texto);white-space:normal}
  .campo .v{color:var(--texto-2);text-align:right;overflow-wrap:anywhere}
  .campo .v.positivo{color:var(--vermelho);font-weight:700}
  .texto-formatado{white-space:pre-wrap;overflow-wrap:anywhere}
  .queixa-box{display:grid;gap:8px}
  .queixa-linha{display:flex;align-items:center;gap:8px;border:1px solid var(--vermelho-borda);border-radius:5px;padding:10px 12px;color:var(--vermelho);font-size:11px;font-weight:600}
  .queixa-linha svg{width:14px;height:14px;fill:var(--vermelho);flex:none}
  .ocorrencia-card{border:1px solid var(--borda);border-radius:8px;background:var(--fundo-card);padding:14px;margin-top:10px;break-inside:avoid;font-size:11px}
  .ocorrencia-card p{margin-bottom:4px}
  .ocorrencia-card b{color:var(--muted)}
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
  @media print{.toolbar{display:none}.pagina{max-width:none;padding:0}}
</style>
</head>
<body>
<div class="pagina" id="relatorio"></div>
<script id="dados-consulta" type="application/json">__DATA__</script>
<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function campo(p){return '<div class="campo"><span class="l">'+esc(p[0])+':</span><span class="v'+(p[2]?' positivo':'')+'">'+esc(p[1]||'-')+'</span></div>'}
  function secao(titulo,corpo,icone){return '<section class="secao"><div class="titulo">'+(icone||'')+esc(titulo)+'</div><div class="corpo">'+corpo+'</div></section>'}
  var I={carro:'<svg viewBox="0 0 24 24"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7zm2.2-1h9.6l-1-3H8.2l-1 3z"/></svg>',roubo:'<svg viewBox="0 0 24 24"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7zm2.2-1h9.6l-1-3H8.2l-1 3zM4 3l3 2M20 3l-3 2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="11" r="2" fill="currentColor"/></svg>',info:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 3h2v2h-2V5zm0 4h2v8h-2V9z"/></svg>',alerta:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'};
  function render(d){
    var h=[];
    h.push('<header class="cabecalho">'+(d.logoUrl?'<div class="logo"><img src="'+esc(d.logoUrl)+'" alt="Olho no Doc"></div>':'')+
      '<div class="info"><div><b>CONSULTA Nº:</b> '+esc(d.numero||'-')+'</div><div><b>CONFIDENCIAL PARA:</b> '+esc(d.cliente||'-')+'</div><div><b>REALIZADA EM:</b> '+esc(d.realizadaEm||'-')+'</div></div>'+
      '<div class="placa-mercosul"><div class="topo"><span>MERCOSUL</span><span>BRASIL</span><span class="bandeira"></span></div><div class="num">'+esc(d.placa||'-')+'</div></div></header>');
    if(d.selos&&d.selos.length) h.push('<div class="selos">'+d.selos.map(function(s){return '<div class="selo-alerta">'+(s.icone==='carro'?I.roubo:I.alerta)+'<span>'+esc(s.texto).replace(/\\n/g,'<br>')+'</span></div>'}).join('')+'</div>');
    h.push(secao('Informações do veículo - Base Nacional','<div class="campos">'+d.campos.map(campo).join('')+'</div>',I.carro));
    h.push(secao('RESTRIÇÕES E OUTRAS INFORMAÇÕES','<div class="texto-formatado">'+esc(d.restricoes||'NADA CONSTA')+'</div>',I.info));
    h.push(secao('Queixa e histórico de roubo e furto','<div class="queixa-box"><div class="queixa-linha">'+I.alerta+'<span>'+(d.queixaAtiva?'Existe ocorrência de roubo e furto':'Não existe queixa de roubo e furto ativa')+'</span></div><div class="queixa-linha">'+I.alerta+'<span>'+(d.historicoRfAtivo?'Existe histórico de roubo e furto':'Não existe histórico de roubo e furto')+'</span></div></div>',I.info));
    if(d.ocorrencias&&d.ocorrencias.length){h.push(secao('HISTÓRICO DE OCORRÊNCIAS',d.ocorrencias.map(function(o){return '<div class="ocorrencia-card"><p><b>Ocorrência:</b> '+esc(o.ocorrencia)+'</p><p><b>Ano:</b> '+esc(o.ano)+'</p><p><b>Órgão de segurança:</b> '+esc(o.orgaoSeguranca)+'</p><p><b>Nº do boletim:</b> '+esc(o.numeroBo)+'</p><p><b>Município/UF:</b> '+esc(o.municipioUf)+'</p><p><b>Data da ocorrência:</b> '+esc(o.dataOcorrencia)+'</p></div>'}).join(''),I.info));}
    if(d.qrCode){h.push('<div class="spec-validacao"><img src="'+esc(d.qrCode)+'" alt="QR Code de validação"/><div><b>CONSULTA ORIGINAL E VALIDADA PELA OLHO NO DOC</b><small>Escaneie o QR Code para conferir a autenticidade.</small>'+(d.validationUrl?'<small>'+esc(d.validationUrl)+'</small>':'')+'</div></div>')}
    h.push('<div class="spec-selos"><span class="selo"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;vertical-align:middle"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg> QUALIDADE GARANTIDA</span><span class="selo"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;vertical-align:middle"><path d="M12 2a10 10 0 0 0-10 10v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6A10 10 0 0 0 12 2z"/></svg> SITE SEGURO</span></div><div class="spec-fim">FIM DESTA PESQUISA.</div>');
    h.push('<div class="avisos"><h3>Avisos legais</h3><p>As informações desta consulta são confidenciais e destinadas exclusivamente ao solicitante, para fins legítimos de análise, prevenção à fraude e verificação de procedência veicular.</p><p>A Olho no Doc reúne e transmite fielmente informações obtidas em bases públicas e privadas na data da consulta, não se responsabilizando por alterações posteriores.</p><p>Esta consulta não substitui a verificação direta junto aos órgãos oficiais.</p></div>');
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
