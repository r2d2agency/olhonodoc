import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const routes = ['', '/consultas', '/comparar-consultas', '/exemplo-relatorio', '/como-funciona', '/precos', '/blog', '/faq', '/sobre', '/contato', '/login', '/termos-de-uso', '/politica-de-privacidade', '/politica-de-cookies', '/politica-de-reembolso'];
  return routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date('2026-09-18'), changeFrequency: 'monthly', priority: route === '' ? 1 : .7 }));
}