import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://olhonodoc.com.br';
  const routes = ['', '/consultas', '/comparar-consultas', '/exemplo-relatorio', '/como-funciona', '/precos', '/blog', '/faq', '/sobre', '/contato', '/login', '/termos-de-uso', '/politica-de-privacidade', '/politica-de-cookies', '/politica-de-reembolso'];
  return routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date('2026-09-18'), changeFrequency: 'monthly', priority: route === '' ? 1 : .7 }));
}