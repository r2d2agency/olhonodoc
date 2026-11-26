'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth-modal';
import { readJson } from '@/lib/client-response';

export default function HomeAccountButton() {
  const [open, setOpen] = useState(false);
  async function go() {
    try {
      const r = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await readJson(r);
      if (data.authenticated) window.location.href = '/minha-conta';
      else setOpen(true);
    } catch { setOpen(true); }
  }
  return <><button type="button" className="login-link header-login" onClick={() => void go()}>Minha conta</button><AuthModal open={open} onClose={() => setOpen(false)} onSuccess={() => { window.location.href = '/minha-conta'; }} /></>;
}
