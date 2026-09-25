export type TrackingEvent = 'page_view' | 'view_item' | 'plate_submitted' | 'sign_up' | 'begin_checkout' | 'add_payment_info' | 'purchase' | 'search' | 'consultation_started' | 'consultation_completed' | 'lead' | 'cart_abandoned';
export function trackEvent(event: TrackingEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === 'undefined') return;
  const detail = { event, ...params };
  window.dispatchEvent(new CustomEvent('olhonodoc-track', { detail }));
  const win = window as typeof window & { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void };
  win.gtag?.('event', event, params);
  win.fbq?.('track', event, params);
}
export function captureAttribution() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search); const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']; const data: Record<string, string> = {};
  keys.forEach((key) => { const value = params.get(key); if (value) data[key] = value; });
  if (Object.keys(data).length) { try { localStorage.setItem('olhonodoc_attribution', JSON.stringify(data)); } catch { /* storage unavailable */ } }
  try { return { ...JSON.parse(localStorage.getItem('olhonodoc_attribution') || '{}'), ...data }; } catch { return data; }
}
