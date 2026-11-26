'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import AuthModal from '@/components/auth-modal';
import { readJson } from '@/lib/client-response';

export default function HomeMobileNav() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  async function account() {
    setOpen(false);
    try {
      const r = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await readJson(r);
      if (data.authenticated) window.location.href = '/minha-conta';
      else setAuthOpen(true);
    } catch { setAuthOpen(true); }
  }
  return <>
    <button type="button" className="home-mobile-nav-button" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
    {open && <nav className="home-mobile-nav" aria-label="Menu mobile">
      <Link href="/" onClick={() => setOpen(false)}>Início</Link>
      <Link href="#o-que-consultamos" onClick={() => setOpen(false)}>O que consultar</Link>
      <Link href="#como-funciona" onClick={() => setOpen(false)}>Como funciona</Link>
      <Link href="#planos" onClick={() => setOpen(false)}>Consultas</Link>
      <Link href="#duvidas" onClick={() => setOpen(false)}>Dúvidas</Link>
      <Link href="/sobre" onClick={() => setOpen(false)}>Sobre</Link>
      <button type="button" onClick={() => void account()}>Minha conta</button>
      <Link className="button" href="#consultar" onClick={() => setOpen(false)}>Fazer análise <ArrowRight size={15}/></Link>
    </nav>}
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { window.location.href = '/minha-conta'; }} />
  </>;
}
