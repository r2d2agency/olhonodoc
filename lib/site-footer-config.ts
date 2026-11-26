export type SocialLinks = { instagram: string; facebook: string; youtube: string; linkedin: string; whatsapp: string };

export const defaultFooter = {
  description: 'Informação para você decidir melhor antes de comprar um veículo.',
  copyright: '© 2026 Olho no Doc',
  social: { instagram: '', facebook: '', youtube: '', linkedin: '', whatsapp: '' } as SocialLinks,
  phone: '',
  email: '',
  floatingWhatsapp: '',
  columns: [
    { title: 'Consultas', links: [{ label: 'Consulta Premium', href: '/consultas/consulta-premium' }, { label: 'Consulta Essencial', href: '/consultas/consulta-essencial' }, { label: 'Comparar consultas', href: '/comparar-consultas' }] },
    { title: 'Institucional', links: [{ label: 'Como funciona', href: '/como-funciona' }, { label: 'Sobre', href: '/sobre' }, { label: 'FAQ', href: '/faq' }, { label: 'Contato', href: '/contato' }] },
    { title: 'Conteúdos', links: [{ label: 'Blog', href: '/blog' }, { label: 'Exemplo de relatório', href: '/exemplo-relatorio' }, { label: 'Termos de uso', href: '/termos-de-uso' }, { label: 'Privacidade', href: '/politica-de-privacidade' }, { label: 'Cookies', href: '/politica-de-cookies' }, { label: 'Reembolso', href: '/politica-de-reembolso' }] },
  ],
};
