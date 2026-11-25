'use client';

import { FormEvent, useState } from 'react';
import { Check, LoaderCircle, X } from 'lucide-react';
import { readJson } from '@/lib/client-response';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'register';
  plate?: string;
};

export default function AuthModal({ open, onClose, onSuccess, initialMode = 'login', plate }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/quick-register';
      const payload = mode === 'login' ? { email, password } : { name, email, password, phone };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await readJson(response);
      if (!response.ok) throw new Error(body.error || 'Não foi possível concluir.');
      onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível conectar ao servidor.'); }
    finally { setLoading(false); }
  }

  return <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Entrar na conta' : 'Criar conta'}>
    <div className="auth-modal">
      <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Fechar"><X size={18}/></button>
      <span className="eyebrow">Área do cliente</span>
      <h2>{mode === 'login' ? 'Entre na sua conta.' : 'Crie seu cadastro.'}</h2>
      <p>{mode === 'login' ? 'Use seu e-mail e senha para continuar.' : 'Cadastre-se para acompanhar suas consultas.'}</p>
      <form onSubmit={submit}>
        {mode === 'register' && <>
          <label>Nome completo<input required value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" autoComplete="name"/></label>
          <label>WhatsApp com DDD<input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" autoComplete="tel"/></label>
        </>}
        <label>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email"/></label>
        <label>Senha<input required type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
        {error && <p className="auth-message auth-error">{error}</p>}
        <button className="button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar cadastro'}</button>
      </form>
      <button type="button" className="auth-change" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'Primeiro acesso? Criar cadastro' : 'Já tenho cadastro'}
      </button>
    </div>
  </div>;
}
