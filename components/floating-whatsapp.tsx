'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [url, setUrl] = useState('');
  useEffect(() => {
    fetch('/api/site/footer').then(r => r.json()).then(d => setUrl(String(d?.floatingWhatsapp || ''))).catch(() => undefined);
  }, []);
  if (!url) return null;
  return <a className="whatsapp-float" href={url} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp"><MessageCircle size={26}/></a>;
}
