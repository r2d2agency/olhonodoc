'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type Tracking = {
  ga4: string; googleAds: string; googleAdsConversion?: string; metaPixel: string;
  customHead: string; customBody: string; enabled: boolean; consentRequired: boolean;
};

export default function TrackingScripts() {
  const [config, setConfig] = useState<Tracking | null>(null);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    fetch('/api/site/tracking').then(r => r.json()).then(data => { if (data?.enabled) setConfig(data); }).catch(() => undefined);
    const read = () => { try { setConsent(localStorage.getItem('olhonodoc_tracking_consent') === 'yes'); } catch { setConsent(false); } };
    read();
    window.addEventListener('olhonodoc-consent', read);
    return () => window.removeEventListener('olhonodoc-consent', read);
  }, []);

  // Tags customizadas (cabeçalho/body) devem rodar mesmo sem GA4, desde que ativadas.
  const blocked = Boolean(config?.consentRequired && !consent);
  if (!config || blocked) return null;

  return <>
    {config.customHead && <Script id="olhonodoc-custom-head" strategy="afterInteractive">{config.customHead}</Script>}
    {config.customBody && <Script id="olhonodoc-custom-body" strategy="afterInteractive">{config.customBody}</Script>}
    {config.ga4 && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4}`} strategy="afterInteractive"/><Script id="olhonodoc-ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${config.ga4}' );`}</Script></>}
    {config.googleAds && <Script id="olhonodoc-google-ads" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('event','page_view',{send_to:'${config.googleAds}'});`}</Script>}
    {config.metaPixel && <Script id="olhonodoc-meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${config.metaPixel}');fbq('track','PageView');`}</Script>}
  </>;
}
