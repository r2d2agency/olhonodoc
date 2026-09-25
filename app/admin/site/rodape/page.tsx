'use client';

import { useEffect, useState } from 'react';

type LinkItem = { label: string; href: string };
type Column = { title: string; links: LinkItem[] };
type FooterConfig = { description: string; copyright: string; columns: Column[] };

const defaults: FooterConfig = { description: '', copyright: '', columns: [] };

export default function FooterAdminPage() {
  const [config, setConfig] = useState<FooterConfig>(defaults);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/admin/footer').then((response) => response.json()).then((data) => setConfig(data)).catch(() => setMessage('Não foi possível carregar o rodapé.')); }, []);
  async function save() { setSaving(true); const response = await fetch('/api/admin/footer', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) }); setMessage(response.ok ? 'Rodapé salvo.' : 'Não foi possível salvar.'); setSaving(false); }
  function updateColumn(index: number, patch: Partial<Column>) { setConfig((current) => ({ ...current, columns: current.columns.map((column, itemIndex) => itemIndex === index ? { ...column, ...patch } : column) })); }
  function updateLink(columnIndex: number, linkIndex: number, patch: Partial<LinkItem>) { setConfig((current) => ({ ...current, columns: current.columns.map((column, index) => index === columnIndex ? { ...column, links: column.links.map((link, itemIndex) => itemIndex === linkIndex ? { ...link, ...patch } : link) } : column) })); }
  return <main className="admin-cms"><header className="admin-cms-header"><div><span className="admin-cms-kicker">SITE / RODAPÉ</span><h1>Rodapé do site</h1><p>Edite a descrição, copyright e os links públicos.</p></div><button className="admin-cms-primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button></header>{message && <div className="admin-cms-message">{message}</div>}<section className="admin-panel-card"><label>Descrição<textarea value={config.description} onChange={(event) => setConfig({ ...config, description: event.target.value })}/></label><label>Copyright<input value={config.copyright} onChange={(event) => setConfig({ ...config, copyright: event.target.value })}/></label></section><div className="admin-product-editor-grid">{config.columns.map((column, columnIndex) => <section className="admin-panel-card" key={`${column.title}-${columnIndex}`}><label>Título da coluna<input value={column.title} onChange={(event) => updateColumn(columnIndex, { title: event.target.value })}/></label>{column.links.map((link, linkIndex) => <div className="admin-footer-link-row" key={`${link.label}-${linkIndex}`}><input value={link.label} onChange={(event) => updateLink(columnIndex, linkIndex, { label: event.target.value })}/><input value={link.href} onChange={(event) => updateLink(columnIndex, linkIndex, { href: event.target.value })}/></div>)}</section>)}</div></main>;
}
