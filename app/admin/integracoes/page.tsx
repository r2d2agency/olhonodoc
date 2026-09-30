'use client';

import { useEffect, useState } from 'react';

type Config = {
  activeProvider: 'none' | 'mercadopago' | 'asaas';
  environment: 'sandbox' | 'production';
  mercadopago: { configured: boolean; publicKey: string; webhookConfigured: boolean };
  asaas: { configured: boolean; webhookConfigured: boolean };
};
type PreviewResult = { url: string; filename: string; size: number; popupBlocked: boolean };

const empty: Config = { activeProvider: 'none', environment: 'sandbox', mercadopago: { configured: false, publicKey: '', webhookConfigured: false }, asaas: { configured: false, webhookConfigured: false } };

export default function IntegrationsPage() {
  const [config, setConfig] = useState<Config>(empty);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [secrets, setSecrets] = useState({ mpToken: '', mpPublic: '', mpWebhook: '', asaasKey: '', asaasWebhook: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewPlate, setPreviewPlate] = useState('');
  const [previewJson, setPreviewJson] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/payment-providers')
      .then(async response => { if (!response.ok) throw new Error('Não foi possível carregar as configurações.'); return response.json(); })
      .then(setConfig)
      .catch(error => setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível carregar as configurações.' }));
  }, []);

  async function test() {
    setTesting(true); setMessage(null);
    try { const response = await fetch('/api/admin/payment-providers/test', { method: 'POST' }); const body = await response.json(); setMessage(response.ok ? { type: 'success', text: 'Conexão validada.' } : { type: 'error', text: body.error || 'Não foi possível testar.' }); }
    catch { setMessage({ type: 'error', text: 'Falha de rede ao testar a conexão.' }); }
    finally { setTesting(false); }
  }

  async function preview() {
    const plate = previewPlate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) { setMessage({ type: 'error', text: 'Informe uma placa válida com 7 caracteres.' }); return; }
    const previewWindow = window.open('', '_blank');
    if (previewWindow) { previewWindow.document.title = 'Gerando preview Perícia Gold…'; previewWindow.document.body.innerHTML = '<p style="font-family:Arial;padding:24px">Gerando o PDF de teste…</p>'; }
    setPreviewing(true); setPreviewResult(null); setMessage(null);
    try {
      let parsedJson: unknown;
      if (previewJson.trim()) { try { parsedJson = JSON.parse(previewJson); } catch { throw new Error('O JSON informado não é válido.'); } if (!parsedJson || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) throw new Error('O JSON deve conter um objeto de resposta Company.'); }
      const response = await fetch('/api/admin/company/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plate, response: parsedJson }) });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/pdf')) { const body = await response.json().catch(() => null); throw new Error(body?.error || `O servidor não retornou um PDF (HTTP ${response.status}).`); }
      const blob = await response.blob();
      if (!blob.size) throw new Error('O servidor retornou um PDF vazio.');
      const url = URL.createObjectURL(blob); const popupBlocked = !previewWindow;
      if (previewWindow) previewWindow.location.href = url;
      setPreviewResult({ url, filename: `preview-pericia-${plate}.pdf`, size: blob.size, popupBlocked });
      setMessage({ type: 'success', text: popupBlocked ? 'PDF gerado. O navegador bloqueou a aba; use o botão Baixar PDF.' : 'PDF gerado. A visualização foi aberta em uma nova aba.' });
      window.setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
    } catch (error) { if (previewWindow) previewWindow.close(); setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Falha ao gerar o preview.' }); }
    finally { setPreviewing(false); }
  }

  async function save() {
    setSaving(true); setMessage(null);
    try { const response = await fetch('/api/admin/payment-providers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeProvider: config.activeProvider, environment: config.environment, mercadopago: { accessToken: secrets.mpToken, publicKey: secrets.mpPublic || config.mercadopago.publicKey, webhookSecret: secrets.mpWebhook }, asaas: { apiKey: secrets.asaasKey, webhookToken: secrets.asaasWebhook } }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Não foi possível salvar.'); setConfig(body); setSecrets({ mpToken: '', mpPublic: '', mpWebhook: '', asaasKey: '', asaasWebhook: '' }); setMessage({ type: 'success', text: 'Configuração de pagamentos salva.' }); }
    catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível salvar.' }); }
    finally { setSaving(false); }
  }

  return <main className="admin-cms integrations-page">
    <header className="admin-cms-header integrations-header"><div><span className="admin-cms-kicker">SISTEMA / INTEGRAÇÕES</span><h1>Pagamentos e testes</h1><p>Configure o provedor ativo e valide o laudo Perícia Gold sem criar uma consulta real.</p></div><div className="integrations-header-actions"><button className="admin-secondary-button" onClick={test} disabled={testing}>{testing ? 'Testando…' : 'Testar conexão'}</button><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button></div></header>
    {message && <div className={`admin-cms-message ${message.type === 'error' ? 'error' : ''}`} role="status">{message.text}</div>}
    <section className="integration-hero"><div><span className="integration-kicker">AMBIENTE DE COBRANÇA</span><h2>Controle suas integrações em um só lugar</h2><p>Segredos nunca são exibidos novamente. Os campos vazios preservam os valores já configurados.</p></div><div className={`integration-status ${config.activeProvider === 'none' ? 'neutral' : ''}`}><span />{config.activeProvider === 'none' ? 'Nenhum provedor ativo' : `${config.activeProvider === 'mercadopago' ? 'Mercado Pago' : 'Asaas'} · ${config.environment === 'sandbox' ? 'Sandbox' : 'Produção'}`}</div></section>
    <section className="admin-panel-card gold-preview-card"><div className="integration-card-heading"><div><span className="integration-kicker">LABORATÓRIO VISUAL</span><h2>Preview do laudo Perícia Gold</h2><p>Use a resposta de demonstração ou cole o JSON real da Company para conferir como os dados serão apresentados.</p></div><span className="integration-safe-badge">Somente preview</span></div><div className="integration-preview-grid"><div className="integration-preview-fields"><label>Placa para teste<input className="admin-input" value={previewPlate} maxLength={7} placeholder="ABC1D23" onChange={e => setPreviewPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}/></label><label>Resposta Company (opcional)<textarea className="admin-input integration-json" value={previewJson} placeholder="Cole aqui o JSON retornado pela Perícia Gold…" onChange={e => setPreviewJson(e.target.value)} /></label><button className="admin-cms-primary integration-preview-button" onClick={preview} disabled={previewing}>{previewing ? 'Gerando PDF…' : 'Gerar visualização do PDF'}</button></div><div className="integration-preview-help"><strong>O que este teste faz?</strong><p>Renderiza um PDF local com a mesma estrutura do laudo, sem chamar a Company, criar pedido ou gravar consulta.</p><span>✓ Validação de placa<br />✓ Dados simulados ou JSON colado<br />✓ Visualização e download</span></div></div>{previewResult && <div className="integration-result"><div><strong>PDF pronto</strong><small>{(previewResult.size / 1024).toFixed(1)} KB · arquivo de teste</small></div><a className="admin-secondary-button" href={previewResult.url} download={previewResult.filename}>Baixar PDF</a></div>}</section>
    <section className="admin-panel-card integration-general"><div className="integration-card-heading"><div><span className="integration-kicker">CONFIGURAÇÃO GERAL</span><h2>Provedor e ambiente</h2></div></div><div className="integration-form-grid"><label>Provedor ativo<select value={config.activeProvider} onChange={e => setConfig({ ...config, activeProvider: e.target.value as Config['activeProvider'] })}><option value="none">Nenhum</option><option value="mercadopago">Mercado Pago</option><option value="asaas">Asaas</option></select></label><label>Ambiente<select value={config.environment} onChange={e => setConfig({ ...config, environment: e.target.value as Config['environment'] })}><option value="sandbox">Sandbox / Teste</option><option value="production">Produção</option></select></label></div></section>
    <div className="integration-provider-grid"><ProviderCard name="Mercado Pago" configured={config.mercadopago.configured} fields={<><label>Access Token<input type="password" value={secrets.mpToken} placeholder={config.mercadopago.configured ? 'Já configurado · informe para trocar' : 'APP_USR-…'} onChange={e => setSecrets({ ...secrets, mpToken: e.target.value })}/></label><label>Public Key<input value={secrets.mpPublic} placeholder={config.mercadopago.publicKey || 'TEST-…'} onChange={e => setSecrets({ ...secrets, mpPublic: e.target.value })}/></label><label>Webhook secret<input type="password" value={secrets.mpWebhook} placeholder={config.mercadopago.webhookConfigured ? 'Já configurado' : 'Opcional'} onChange={e => setSecrets({ ...secrets, mpWebhook: e.target.value })}/></label></>} /><ProviderCard name="Asaas" configured={config.asaas.configured} fields={<><label>API Key<input type="password" value={secrets.asaasKey} placeholder={config.asaas.configured ? 'Já configurada · informe para trocar' : '$aact_…'} onChange={e => setSecrets({ ...secrets, asaasKey: e.target.value })}/></label><label>Token do webhook<input type="password" value={secrets.asaasWebhook} placeholder={config.asaas.webhookConfigured ? 'Já configurado' : 'Opcional'} onChange={e => setSecrets({ ...secrets, asaasWebhook: e.target.value })}/></label></>} /></div>
  </main>;
}

function ProviderCard({ name, configured, fields }: { name: string; configured: boolean; fields: React.ReactNode }) { return <section className="admin-panel-card integration-provider-card"><div className="integration-provider-heading"><div><span className="integration-kicker">PROVEDOR</span><h2>{name}</h2></div><span className={`integration-configured ${configured ? '' : 'pending'}`}>{configured ? 'Configurado' : 'Pendente'}</span></div><div className="integration-fields">{fields}</div></section>; }
