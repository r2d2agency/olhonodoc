'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); setMessage(''); setLoading(true); try { const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setMessage(body.message); } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível solicitar a recuperação.'); } finally { setLoading(false); } }
  return <section className="auth-page"><div className="auth-box"><Link href="/login" className="auth-back"><ArrowLeft size={15}/> Voltar para o login</Link><span className="eyebrow">Recuperação de acesso</span><h1>Esqueceu sua senha?</h1><p>Informe seu e-mail e, se houver uma conta, enviaremos um link seguro para criar uma nova senha.</p><form onSubmit={submit}><label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" autoComplete="email"/></label>{error && <p className="auth-message auth-error">{error}</p>}{message && <p className="auth-message auth-success"><Mail size={16}/>{message}</p>}<button className="button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17}/> : <ArrowRight size={17}/>} Enviar instruções</button></form></div></section>;
}
