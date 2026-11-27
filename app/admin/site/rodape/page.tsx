'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type LinkItem = { label: string; href: string };
type Column = { title: string; links: LinkItem[] };
type FooterConfig = {
  description: string; copyright: string; phone: string; email: string; floatingWhatsapp: string;
  social: { instagram: string; facebook: string; youtube: string; linkedin: string; whatsapp: string };
  columns: Column[];
};
const defaults: FooterConfig = {
  description: '', copyright: '', phone: '', email: '', floatingWhatsapp: '',
  social: { instagram: '', facebook: '', youtube: '', linkedin: '', whatsapp: '' }, columns: [],
};

export default function FooterAdminPage() {
  const [config, setConfig] = useState<FooterConfig>(defaults);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/admin/footer').then(r => r.json()).then(d => setConfig({ ...defaults, ...d, social: { ...defaults.social, ...(d.social || {}) } })).catch(() => setMessage('Não foi possível carregar.')); }, []);
  async function save() {
    setSaving(true); setMessage('');
    const r = await fetch('/api/admin/footer', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setMessage(r.ok ? 'Rodapé salvo.' : 'Não foi possível salvar.');
    setSaving(false);
  }
  function updateColumn(i: number, patch: Partial<Column>) { setConfig(c => ({ ...c, columns: c.columns.map((col, j) => j === i ? { ...col, ...patch } : col) })); }
  function updateLink(ci: number, li: number, patch: Partial<LinkItem>) { setConfig(c => ({ ...c, columns: c.columns.map((col, i) => i === ci ? { ...col, links: col.links.map((l, j) => j === li ? { ...l, ...patch } : l) } : col) })); }
  function removeLink(ci: number, li: number) { setConfig(c => ({ ...c, columns: c.columns.map((col, i) => i === ci ? { ...col, links: col.links.filter((_, j) => j !== li) } : col) })); }
  function removeColumn(ci: number) { setConfig(c => ({ ...c, columns: c.columns.filter((_, i) => i !== ci) })); }

  return <main className="admin-cms">
    <header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / RODAPÉ</span><h1>Rodapé do site</h1><p>Descrição, contatos, redes sociais, WhatsApp flutuante e links legais.</p></div><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : <><Save size={15}/> Salvar alterações</>}</button></header>
    {message && <div className="admin-cms-message">{message}</div>}

    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">INFORMAÇÕES GERAIS</span><h2>Texto e identificação</h2></div></div>
      <div className="admin-form-grid">
        <label className="wide">Descrição<textarea value={config.description} onChange={e => setConfig({ ...config, description: e.target.value })}/></label>
        <label>Copyright<input value={config.copyright} onChange={e => setConfig({ ...config, copyright: e.target.value })}/></label>
        <label>Telefone de contato<input value={config.phone} onChange={e => setConfig({ ...config, phone: e.target.value })} placeholder="(00) 00000-0000"/></label>
        <label>E-mail de contato<input value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} placeholder="contato@olhonodoc.com"/></label>
      </div>
    </section>

    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">LINK DOS ÍCONES</span><h2>Redes sociais</h2><p>Os ícones aparecem no rodapé de todas as páginas quando o link estiver preenchido.</p></div></div>
      <div className="admin-form-grid">
        <label>Instagram<input value={config.social.instagram} onChange={e => setConfig({ ...config, social: { ...config.social, instagram: e.target.value } })} placeholder="https://instagram.com/..."/></label>
        <label>Facebook<input value={config.social.facebook} onChange={e => setConfig({ ...config, social: { ...config.social, facebook: e.target.value } })} placeholder="https://facebook.com/..."/></label>
        <label>YouTube<input value={config.social.youtube} onChange={e => setConfig({ ...config, social: { ...config.social, youtube: e.target.value } })} placeholder="https://youtube.com/..."/></label>
        <label>LinkedIn<input value={config.social.linkedin} onChange={e => setConfig({ ...config, social: { ...config.social, linkedin: e.target.value } })} placeholder="https://linkedin.com/..."/></label>
        <label>WhatsApp (ícone do rodapé)<input value={config.social.whatsapp} onChange={e => setConfig({ ...config, social: { ...config.social, whatsapp: e.target.value } })} placeholder="https://wa.me/5500000000000"/></label>
        <label className="wide">Botão flutuante do WhatsApp (aparece em todas as páginas)<input value={config.floatingWhatsapp} onChange={e => setConfig({ ...config, floatingWhatsapp: e.target.value })} placeholder="https://wa.me/5500000000000 — deixe vazio para ocultar"/></label>
      </div>
    </section>

    <section className="admin-panel-card">
      <div className="admin-card-heading"><div><span className="admin-eyebrow">LINKS LEGAIS</span><h2>Colunas do rodapé</h2><p>Garanta que a coluna Conteúdos tenha Termos de uso, Privacidade, Cookies e Reembolso.</p></div></div>
      <div className="admin-product-editor-grid">{config.columns.map((column, ci) => <section className="admin-panel-card" key={`${column.title}-${ci}`}>
        <div className="admin-footer-column-head"><label>Título da coluna<input value={column.title} onChange={e => updateColumn(ci, { title: e.target.value })}/></label><button type="button" className="admin-footer-remove" onClick={() => removeColumn(ci)} aria-label="Remover coluna">Remover coluna</button></div>
        {column.links.map((link, li) => <div className="admin-footer-link-row" key={`${link.label}-${li}`}><input value={link.label} onChange={e => updateLink(ci, li, { label: e.target.value })}/><input value={link.href} onChange={e => updateLink(ci, li, { href: e.target.value })}/><button type="button" className="admin-footer-remove" onClick={() => removeLink(ci, li)} aria-label="Remover link">✕</button></div>)}
        <button type="button" className="admin-secondary-button" onClick={() => updateColumn(ci, { links: [...column.links, { label: 'Novo link', href: '/' }] })}>+ Adicionar link</button>
      </section>)}</div>
    </section>
    <div className="admin-cms-actions"><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : <><Save size={15}/> Salvar alterações</>}</button></div>
  </main>;
}
