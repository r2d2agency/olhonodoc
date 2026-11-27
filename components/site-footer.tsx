'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, MessageCircle, Mail, Phone } from 'lucide-react';
import { companyInfo } from '@/lib/company-info';
import { defaultFooter } from '@/lib/site-footer-config';

type FooterConfig = typeof defaultFooter;
const fallback = defaultFooter;

export default function SiteFooter() {
  const [config, setConfig] = useState<FooterConfig>(fallback);
  useEffect(() => {
    fetch('/api/site/footer').then(response => response.json()).then(data => { if (data?.columns) setConfig(data); }).catch(() => undefined);
  }, []);
  const legal = `Olho no Doc Tecnologia e Informações Veiculares Ltda · CNPJ ${companyInfo.cnpj}`;
  const copyrightText = config.copyright.includes('CNPJ') ? config.copyright : `${config.copyright} · ${legal}`;
  const social = config.social || {};
  const links = [
    ['Instagram', social.instagram, <Instagram size={17} key="i"/>],
    ['Facebook', social.facebook, <Facebook size={17} key="f"/>],
    ['YouTube', social.youtube, <Youtube size={17} key="y"/>],
    ['LinkedIn', social.linkedin, <Linkedin size={17} key="l"/>],
    ['WhatsApp', social.whatsapp, <MessageCircle size={17} key="w"/>],
  ] as const;
  return <footer className="footer">
    <div className="footer-top">
      <div><Link href="/" className="brand brand-light"><img src="/logo-olho-no-doc.png" alt="Olho no Doc" style={{height:34,width:"auto"}}/></Link><p>{config.description}</p></div>
      <div className="footer-links">{config.columns.map((column) => <div key={column.title}><strong>{column.title}</strong>{column.links.map((link) => <Link href={link.href} key={`${column.title}-${link.label}`}>{link.label}</Link>)}</div>)}</div>
    </div>
    <div className="footer-social">{links.filter(([, url]) => url).map(([label, url, icon]) => <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} key={label}>{icon}<span>{label}</span></a>)}</div>
    {(config.phone || config.email) && <div className="footer-contact">{config.phone && <a href={`tel:${config.phone.replace(/\D/g, '')}`}><Phone size={14}/> {config.phone}</a>}{config.email && <a href={`mailto:${config.email}`}><Mail size={14}/> {config.email}</a>}</div>}
    {config.floatingWhatsapp && <a className="whatsapp-float" href={config.floatingWhatsapp} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp"><MessageCircle size={26}/></a>}
    <div className="footer-ssl"><img src="/selo-ssl.svg" alt="Site 100% seguro — SSL certificado"/><img src="/selo-google-seguro.svg" alt="Site seguro — clique para verificar"/></div>
    <div className="footer-bottom"><span>{copyrightText}</span><span>Consulte antes de comprar.</span></div>
  </footer>;
}
