export const ESTADUAL_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consulta Base Estadual</title>
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
  .secao>.titulo{background:var(--azul);color:#fff;font-weight:700;font-size:12.5px;padding:12px 16px;display:flex;align-items:center;gap:10px}
  .secao>.titulo svg{width:16px;height:16px;fill:#fff;flex:none}
  .secao>.corpo{padding:16px}
  .secao.alerta>.titulo{background:#b94a48}
  .campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 18px}
  .campo{display:flex;justify-content:space-between;gap:10px;border-bottom:1px dotted var(--borda);padding-bottom:4px;min-width:0}
  .campo .l{font-weight:700;color:var(--texto);white-space:normal}
  .campo .v{color:var(--texto-2);text-align:right;overflow-wrap:anywhere}
  .campo .v.positivo{color:var(--vermelho);font-weight:700}
  .proprietario{font-weight:700}
  .spec-validacao{display:flex;align-items:center;justify-content:center;gap:14px;margin:18px 0;padding:14px;border:1px solid var(--verde-borda);border-radius:8px;background:var(--verde-bg)}
  .spec-validacao img{width:90px;height:90px;flex:none}
  .spec-validacao b{color:var(--verde-escuro);font-size:11px}
  .spec-validacao small{color:var(--texto-2);font-size:9px;overflow-wrap:anywhere;display:block}
  .spec-selos{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 8px;flex-wrap:wrap}
  .selo-qualidade{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:#fff9e6}
  .selo-qualidade svg{width:42px;height:42px}
  .selo-qualidade b{color:#8a6d0b;font-size:11px;display:block}
  .selo-qualidade small{color:#8a6d0b;font-size:9px}
  .selo-site{display:flex;align-items:center;gap:10px;color:var(--verde-escuro);font-weight:800}
  .selo-site svg{width:28px;height:28px;fill:var(--verde)}
  .selo-site small{display:block;font-weight:400;font-size:9px;color:var(--texto-2)}
  .spec-fim{text-align:center;font-weight:800;font-size:13px;margin:10px 0 16px;letter-spacing:1px}
  .avisos{border-top:1px solid var(--borda);margin-top:12px;padding-top:20px}
  .avisos h3{font-size:13px;text-transform:uppercase;margin-bottom:12px}
  .avisos p{color:var(--muted);text-align:justify;margin-bottom:10px;font-size:10.5px;line-height:1.6}
  @page{size:A4;margin:12mm 10mm}
  @media print{.toolbar{display:none}.pagina{max-width:none;padding:0}.campos{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:18px}.campo{flex-direction:column;gap:2px;padding-bottom:4px}.campo .l{font-size:10px}.campo .v{text-align:left;font-size:11px;overflow-wrap:anywhere;word-break:break-word}}
</style>
</head>
<body>
<div class="pagina" id="relatorio"></div>
<script id="dados-consulta" type="application/json">__DATA__</script>
<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function campo(p){return '<div class="campo"><span class="l">'+esc(p[0])+':</span><span class="v'+(p[2]?' positivo':'')+'">'+esc(p[1]||'-')+'</span></div>'}
  function secao(titulo,corpo,icone,alerta){return '<section class="secao'+(alerta?' alerta':'')+'"><div class="titulo">'+(icone||'')+esc(titulo)+'</div><div class="corpo">'+corpo+'</div></section>'}
  var I={carro:'<svg viewBox="0 0 24 24"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7zm2.2-1h9.6l-1-3H8.2l-1 3z"/></svg>',info:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 3h2v2h-2V5zm0 4h2v8h-2V9z"/></svg>',alerta:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',usuario:'<svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 3-9 6v2h18v-2c0-3-4-6-9-6z"/></svg>',dinheiro:'<svg viewBox="0 0 24 24"><path d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v8h16V8H4z"/></svg>'};
  function render(d){
    var h=[];
    h.push('<header class="cabecalho">'+(d.logoUrl?'<div class="logo"><img src="'+esc(d.logoUrl)+'" alt="Olho no Doc"></div>':'')+
      '<div class="info"><div><b>CONSULTA Nº:</b> '+esc(d.numero||'-')+'</div><div><b>CONFIDENCIAL PARA:</b> '+esc(d.cliente||'-')+'</div><div><b>REALIZADA EM:</b> '+esc(d.realizadaEm||'-')+'</div></div>'+
      '<div class="placa-mercosul"><div class="topo"><span>MERCOSUL</span><span>BRASIL</span><span class="bandeira"></span></div><div class="num">'+esc(d.placa||'-')+'</div></div></header>');
    if(d.selos&&d.selos.length) h.push('<div class="selos">'+d.selos.map(function(s){return '<div class="selo-alerta">'+I.alerta+'<span>'+esc(s)+'</span></div>'}).join('')+'</div>');
    h.push(secao('Base estadual','<div class="campos">'+d.campos.map(campo).join('')+'</div>',I.carro));
    h.push(secao('Informações de proprietário','<div class="proprietario">Proprietário Atual: '+esc(d.proprietario||'-')+'</div>',I.usuario));
    h.push(secao('Débitos do veículo','<div class="campos">'+d.debitos.map(campo).join('')+'</div>',I.dinheiro));
    h.push(secao('Restrições','<div class="campos">'+d.restricoes.map(campo).join('')+'</div>',I.info,true));
    if(d.outras&&d.outras.length) h.push(secao('OUTRAS RESTRIÇÕES','<div class="campos">'+d.outras.map(campo).join('')+'</div>',I.info));
    if(d.qrCode){h.push('<div class="spec-validacao"><img src="'+esc(d.qrCode)+'" alt="QR Code de validação"/><div><b>CONSULTA ORIGINAL E VALIDADA PELA OLHO NO DOC</b><small>Escaneie o QR Code para conferir a autenticidade.</small>'+(d.validationUrl?'<small>'+esc(d.validationUrl)+'</small>':'')+'</div></div>')}
    h.push('<div class="spec-selos"><div class="selo-qualidade"><svg viewBox="0 0 48 48"><path fill="#d4a017" d="M24 3l5 11 12 1.5-9 8.5 2.5 12L24 30l-10.5 6 2.5-12-9-8.5L19 14z"/><path fill="#fff" d="M18 23l4 4 8-8" stroke="#fff" stroke-width="2"/></svg><span><b>Qualidade Garantida</b><small>Informação segura em tempo real</small></span></div><div class="selo-site"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6A10 10 0 0 0 12 2zm-1 13l-3-3 1.4-1.4 1.6 1.6 5.6-5.6L18 8z"/></svg><span>SITE SEGURO<small>dados criptografados por SSL</small></span></div></div><div class="spec-fim">FIM DESTA PESQUISA.<br><small style="font-size:9px;font-weight:400">Olho no Doc Tecnologia e Informações Veiculares Ltda · CNPJ 69.283.015/0001-00</small></div>');
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
