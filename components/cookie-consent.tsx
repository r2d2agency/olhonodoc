'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { setVisible(localStorage.getItem('olhonodoc_tracking_consent') === null); } catch { setVisible(false); } }, []);
  function decide(value: 'yes' | 'no') { try { localStorage.setItem('olhonodoc_tracking_consent', value); } catch { /* storage may be blocked */ } setVisible(false); window.dispatchEvent(new CustomEvent('olhonodoc-consent', { detail: value })); }
  if (!visible) return null;
  return <aside className="cookie-consent" role="dialog" aria-label="Preferências de cookies"><div><strong>Privacidade e cookies</strong><p>Usamos cookies de medição para entender o uso do site e melhorar sua experiência. Você pode aceitar ou recusar.</p><a href="/politica-de-cookies">Saiba mais</a></div><div className="cookie-consent-actions"><button onClick={() => decide('no')}>Recusar</button><button className="cookie-consent-accept" onClick={() => decide('yes')}>Aceitar</button></div></aside>;
}
