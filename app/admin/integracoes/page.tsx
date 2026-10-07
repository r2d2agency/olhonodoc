'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

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
  const [savingMp, setSavingMp] = useState(false);
  const [savingAsaas, setSavingAsaas] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [secrets, setSecrets] = useState({ mpToken: '', mpPublic: '', mpWebhook: '', asaasKey: '', asaasWebhook: '' });
  const [messages, setMessages] = useState<{ mp?: string; asaas?: string; general?: string; preview?: string }>({});
  const [previewPlate, setPreviewPlate] = useState('');
  const [previewJson, setPreviewJson] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [copied, setCopied] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/payment-providers').then(async response => { if (!response.ok) throw new Error('Não foi possível carregar as configurações.'); return response.json(); }).then(setConfig).catch(error => setMessages({ preview: error instanceof Error ? error.message : 'Não foi possível carregar as configurações.' }));
  }, []);

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  async function copyWebhook(name: string, url: string) { await navigator.clipboard.writeText(url); setCopied(name); window.setTimeout(() => setCopied(''), 1800); }

  async function testMercadoPago() {
    setMessages(current => ({ ...current, mp: 'Testando conexão com o Mercado Pago…' }));
    try { const response = await fetch('/api/admin/payment-providers/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'mercadopago' }) }); const body = await response.json(); setMessages(current => ({ ...current, mp: response.ok ? 'Mercado Pago validado com sucesso.' : body.error || 'Não foi possível testar o Mercado Pago.' })); }
    catch { setMessages(current => ({ ...current, mp: 'Falha de rede ao testar o Mercado Pago.' })); }
  }

  async function testAsaas() {
    setMessages(current => ({ ...current, asaas: 'Testando conexão com o Asaas…' }));
    try { const response = await fetch('/api/admin/payment-providers/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'asaas' }) }); const body = await response.json(); setMessages(current => ({ ...current, asaas: response.ok ? 'Asaas validado com sucesso.' : body.error || 'Não foi possível testar o Asaas.' })); }
    catch { setMessages(current => ({ ...current, asaas: 'Falha de rede ao testar o Asaas.' })); }
  }

  async function saveProvider(provider: 'mercadopago' | 'asaas') {
    const isMp = provider === 'mercadopago';
    if (isMp) setSavingMp(true); else setSavingAsaas(true);
    setMessages(current => ({ ...current, [provider]: undefined }));
    try {
      const payload = isMp
        ? { mercadopago: { accessToken: secrets.mpToken, publicKey: secrets.mpPublic || config.mercadopago.publicKey, webhookSecret: secrets.mpWebhook } }
        : { asaas: { apiKey: secrets.asaasKey, webhookToken: secrets.asaasWebhook } };
      const response = await fetch('/api/admin/payment-providers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível salvar.');
      setConfig(body);
      if (isMp) setSecrets(current => ({ ...current, mpToken: '', mpPublic: '', mpWebhook: '' })); else setSecrets(current => ({ ...current, asaasKey: '', asaasWebhook: '' }));
      setMessages(current => ({ ...current, [provider]: 'Credenciais salvas com sucesso.' }));
    } catch (error) { setMessages(current => ({ ...current, [provider]: error instanceof Error ? error.message : 'Não foi possível salvar.' })); }
    finally { if (isMp) setSavingMp(false); else setSavingAsaas(false); }
  }

  async function saveGeneral() {
    setSavingGeneral(true); setMessages(current => ({ ...current, general: undefined }));
    try { const response = await fetch('/api/admin/payment-providers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activeProvider: config.activeProvider, environment: config.environment }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Não foi possível salvar.'); setConfig(body); setMessages(current => ({ ...current, general: 'Provedor ativo e ambiente atualizados.' })); }
    catch (error) { setMessages(current => ({ ...current, general: error instanceof Error ? error.message : 'Não foi possível salvar.' })); }
    finally { setSavingGeneral(false); }
  }

  async function preview() {
    const plate = previewPlate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) { setMessages(current => ({ ...current, preview: 'Informe uma placa válida com 7 caracteres.' })); return; }
    const previewWindow = window.open('', '_blank');
    if (previewWindow) { previewWindow.document.title = 'Gerando preview Perícia Gold…'; previewWindow.document.body.innerHTML = '<p style="font-family:Arial;padding:24px">Gerando o PDF de teste…</p>'; }
    setPreviewing(true); setPreviewResult(null); setMessages(current => ({ ...current, preview: undefined }));
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
      setMessages(current => ({ ...current, preview: popupBlocked ? 'PDF gerado. O navegador bloqueou a aba; use o botão Baixar PDF.' : 'PDF gerado. A visualização foi aberta em uma nova aba.' }));
      window.setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
    } catch (error) { if (previewWindow) previewWindow.close(); setMessages(current => ({ ...current, preview: error instanceof Error ? error.message : 'Falha ao gerar o preview.' })); }
    finally { setPreviewing(false); }
  }

  return <main className="admin-cms integrations-page">
    <header className="admin-cms-header integrations-header"><div><span className="admin-cms-kicker">SISTEMA / INTEGRAÇÕES</span><h1>Pagamentos e testes</h1><p>Cadastre credenciais, registre o webhook em cada provedor e valide o laudo Perícia Gold — tudo por operação.</p></div></header>
    <section className="integration-hero"><div><span className="integration-kicker">AMBIENTE DE COBRANÇA</span><h2>Controle suas integrações em um só lugar</h2><p>Segredos nunca são exibidos novamente. Campos vazios preservam os valores já configurados.</p></div><div className={`integration-status ${config.activeProvider === 'none' ? 'neutral' : ''}`}><span />{config.activeProvider === 'none' ? 'Nenhum provedor ativo' : `${config.activeProvider === 'mercadopago' ? 'Mercado Pago' : 'Asaas'} · ${config.environment === 'sandbox' ? 'Sandbox' : 'Produção'}`}</div></section>

    <section className="admin-panel-card gold-preview-card"><div className="integration-card-heading"><div><span className="integration-kicker">LABORATÓRIO VISUAL</span><h2>Preview do laudo Perícia Gold</h2><p>Use a resposta de demonstração ou cole o JSON real da Company para conferir como os dados serão apresentados.</p></div><span className="integration-safe-badge">Somente preview</span></div><div className="integration-preview-grid"><div className="integration-preview-fields"><label>Placa para teste<input className="admin-input" value={previewPlate} maxLength={7} placeholder="ABC1D23" onChange={e => setPreviewPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}/></label><label>Resposta Company (opcional)<textarea className="admin-input integration-json" value={previewJson} placeholder="Cole aqui o JSON retornado pela Perícia Gold…" onChange={e => setPreviewJson(e.target.value)}/></label><button className="admin-cms-primary integration-preview-button" onClick={preview} disabled={previewing}>{previewing ? 'Gerando PDF…' : 'Gerar visualização do PDF'}</button></div><div className="integration-preview-help"><strong>O que este teste faz?</strong><p>Renderiza um PDF local com a mesma estrutura do laudo, sem chamar a Company, criar pedido ou gravar consulta.</p><span>✓ Validação de placa<br />✓ Dados simulados ou JSON colado<br />✓ Visualização e download</span></div></div>{messages.preview && <div className={`admin-cms-message ${/sucesso|pronto|aberta/i.test(messages.preview) ? '' : 'error'}`} role="status">{messages.preview}</div>}{previewResult && <div className="integration-result"><div><strong>PDF pronto</strong><small>{(previewResult.size / 1024).toFixed(1)} KB · arquivo de teste</small></div><a className="admin-secondary-button" href={previewResult.url} download={previewResult.filename}>Baixar PDF</a></div>}</section>

    <section className="admin-panel-card integration-general"><div className="integration-card-heading"><div><span className="integration-kicker">CONFIGURAÇÃO GERAL</span><h2>Provedor e ambiente</h2><p>Define qual gateway cobra e em qual ambiente as chamadas acontecem.</p></div></div><div className="integration-form-grid"><label>Provedor ativo<select value={config.activeProvider} onChange={e => setConfig({ ...config, activeProvider: e.target.value as Config['activeProvider'] })}><option value="none">Nenhum</option><option value="mercadopago">Mercado Pago</option><option value="asaas">Asaas</option></select></label><label>Ambiente<select value={config.environment} onChange={e => setConfig({ ...config, environment: e.target.value as Config['environment'] })}><option value="sandbox">Sandbox / Teste</option><option value="production">Produção</option></select></label></div><div className="integration-actions"><button className="admin-cms-primary" onClick={saveGeneral} disabled={savingGeneral}>{savingGeneral ? 'Salvando…' : 'Salvar provedor e ambiente'}</button>{messages.general && <span className={`integration-action-note ${/atualizados/i.test(messages.general) ? 'ok' : 'error'}`}>{messages.general}</span>}</div></section>

    <div className="integration-provider-grid">
      <ProviderCard name="Mercado Pago" configured={config.mercadopago.configured} webhookUrl={`${origin}/api/webhooks/mercadopago`} webhookCopyLabel={copied === 'mp' ? 'Copiado' : 'Copiar webhook'} onCopyWebhook={() => copyWebhook('mp', `${origin}/api/webhooks/mercadopago`)} webhookNote="No painel do Mercado Pago (Suas integrações → Webhooks), cadastre esta URL em “Notificação de pagamento”. Lá mesmo eles geram uma chave secreta — copie e cole no campo abaixo. Ela é obrigatória: sem ela os avisos são rejeitados." onTest={testMercadoPago} onSave={() => saveProvider('mercadopago')} saving={savingMp} testing={false} message={messages.mp} fields={<><label>Access Token<input type="password" value={secrets.mpToken} placeholder={config.mercadopago.configured ? 'Já configurado · informe para trocar' : 'APP_USR-…'} onChange={e => setSecrets({ ...secrets, mpToken: e.target.value })}/></label><label>Public Key<input value={secrets.mpPublic} placeholder={config.mercadopago.publicKey || 'TEST-…'} onChange={e => setSecrets({ ...secrets, mpPublic: e.target.value })}/></label><label>Webhook secret · chave secreta gerada pelo Mercado Pago<input type="password" value={secrets.mpWebhook} placeholder={config.mercadopago.webhookConfigured ? 'Já configurado · informe para trocar' : 'Cole a chave secreta do painel do Mercado Pago'} onChange={e => setSecrets({ ...secrets, mpWebhook: e.target.value })}/></label></>}/>
      <ProviderCard name="Asaas" configured={config.asaas.configured} webhookUrl={`${origin}/api/webhooks/asaas`} webhookCopyLabel={copied === 'asaas' ? 'Copiado' : 'Copiar webhook'} onCopyWebhook={() => copyWebhook('asaas', `${origin}/api/webhooks/asaas`)} webhookNote="No painel do Asaas, cadastre esta URL como webhook de cobranças e crie um token de sua preferência. O mesmo token deve ser colado no campo abaixo — os dois precisam ser idênticos." onTest={testAsaas} onSave={() => saveProvider('asaas')} saving={savingAsaas} testing={false} message={messages.asaas} fields={<><label>API Key<input type="password" value={secrets.asaasKey} placeholder={config.asaas.configured ? 'Já configurada · informe para trocar' : '$aact_…'} onChange={e => setSecrets({ ...secrets, asaasKey: e.target.value })}/></label><label>Token do webhook · criado por você<input type="password" value={secrets.asaasWebhook} placeholder={config.asaas.webhookConfigured ? 'Já configurado · informe para trocar' : 'Crie um token no Asaas e repita aqui'} onChange={e => setSecrets({ ...secrets, asaasWebhook: e.target.value })}/></label></>}/>
    </div>
  </main>;
}

type ProviderCardProps = { name: string; configured: boolean; webhookUrl: string; webhookCopyLabel: string; onCopyWebhook: () => void; webhookNote: string; onTest: () => void; onSave: () => void; saving: boolean; testing: boolean; message?: string; fields: React.ReactNode };
function ProviderCard({ name, configured, webhookUrl, webhookCopyLabel, onCopyWebhook, webhookNote, onTest, onSave, saving, testing, message, fields }: ProviderCardProps) {
  const isOk = message ? /sucesso|validado/i.test(message) : false;
  return <section className="admin-panel-card integration-provider-card">
    <div className="integration-provider-heading"><div><span className="integration-kicker">PROVEDOR</span><h2>{name}</h2></div><span className={`integration-configured ${configured ? '' : 'pending'}`}>{configured ? 'Configurado' : 'Pendente'}</span></div>
    <div className="integration-webhook"><span><small>URL de webhook para cadastrar no painel do provedor</small><input readOnly value={webhookUrl} aria-label={`Webhook ${name}`}/></span><button type="button" className="admin-secondary-button" onClick={onCopyWebhook}>{webhookCopyLabel === 'Copiado' ? <Check size={14}/> : <Copy size={14}/>}{webhookCopyLabel}</button></div>
    <p className="integration-webhook-note">{webhookNote}</p>
    <div className="integration-fields">{fields}</div>
    <div className="integration-actions"><button className="admin-secondary-button" onClick={onTest} disabled={testing}>{testing ? 'Testando…' : 'Testar conexão'}</button><button className="admin-cms-primary" onClick={onSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar credenciais'}</button></div>
    {message && <span className={`integration-action-note ${isOk ? 'ok' : 'error'}`} role="status">{message}</span>}
  </section>;
}
