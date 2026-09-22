import { prisma } from '@/lib/prisma';

export const HOME_SECTION_TYPES = ['hero', 'benefits', 'premium', 'steps', 'products', 'faq', 'cta'] as const;
export type HomeSectionType = typeof HOME_SECTION_TYPES[number];

export type HomeTheme = {
  logoLight: string;
  logoDark: string;
  primary: string;
  accent: string;
  background: string;
};

export type HomeSectionConfig = { id?: string; type: HomeSectionType; name: string; visible: boolean; settings: Record<string, unknown> };

export const defaultTheme: HomeTheme = { logoLight: '/logo-olho-no-doc.png', logoDark: '/logo-olho-no-doc.png', primary: '#061b2f', accent: '#18c887', background: '#f3f8fb' };
export const defaultSections: HomeSectionConfig[] = [
  { type: 'hero', name: 'Hero principal', visible: true, settings: { eyebrow: 'Inteligência para sua decisão', title: 'Antes de comprar um veículo, descubra o que a placa não conta.', description: 'Consulte informações importantes sobre o veículo em poucos segundos e tenha mais segurança antes de fechar negócio.', imageUrl: '' } },
  { type: 'benefits', name: 'Benefícios', visible: true, settings: { title: 'Conheça o veículo além da aparência.' } },
  { type: 'premium', name: 'Consulta completa', visible: true, settings: { title: 'Quer entender melhor antes de decidir?', imageUrl: '' } },
  { type: 'steps', name: 'Como funciona', visible: true, settings: { title: 'Consultar um veículo é fácil.' } },
  { type: 'products', name: 'Consultas', visible: true, settings: { title: 'Uma consulta para cada momento.' } },
  { type: 'faq', name: 'Dúvidas frequentes', visible: true, settings: {} },
  { type: 'cta', name: 'Chamada final', visible: true, settings: { title: 'Vai comprar um veículo?' } },
];

function safeUrl(value: unknown, fallback = '') {
  if (typeof value !== 'string' || value.length > 4_000_000) return fallback;
  if (!value) return fallback;
  if (value.startsWith('/') || /^https?:\/\//i.test(value)) return value;
  return fallback;
}

function parseTheme(value: unknown): HomeTheme {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return { logoLight: safeUrl(input.logoLight, defaultTheme.logoLight), logoDark: safeUrl(input.logoDark, defaultTheme.logoDark), primary: typeof input.primary === 'string' && /^#[0-9a-f]{6}$/i.test(input.primary) ? input.primary : defaultTheme.primary, accent: typeof input.accent === 'string' && /^#[0-9a-f]{6}$/i.test(input.accent) ? input.accent : defaultTheme.accent, background: typeof input.background === 'string' && /^#[0-9a-f]{6}$/i.test(input.background) ? input.background : defaultTheme.background };
}

export function getDefaultHomeConfig() { return { theme: defaultTheme, sections: defaultSections }; }

export async function getHomeConfig() {
  try {
    const [themeSetting, sections] = await Promise.all([prisma.setting.findUnique({ where: { key: 'home.theme' } }), prisma.homeSection.findMany({ where: { status: 'ACTIVE' }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })]);
    return { theme: parseTheme(themeSetting?.value), sections: sections.length ? sections.map((section) => ({ id: section.id, type: HOME_SECTION_TYPES.includes(section.type as HomeSectionType) ? section.type as HomeSectionType : 'hero', name: section.name, visible: section.status === 'ACTIVE', settings: section.settings as Record<string, unknown> })) : defaultSections };
  } catch { return getDefaultHomeConfig(); }
}

export function sanitizeHomePayload(payload: unknown) {
  const input = payload as { theme?: unknown; sections?: unknown };
  const theme = parseTheme(input?.theme);
  const sections = Array.isArray(input?.sections) ? input.sections.slice(0, 20).map((item, index) => { const section = item as Record<string, unknown>; const type = HOME_SECTION_TYPES.includes(section.type as HomeSectionType) ? section.type as HomeSectionType : null; return type ? { type, name: typeof section.name === 'string' ? section.name.slice(0, 80) : type, visible: section.visible !== false, sortOrder: index, settings: typeof section.settings === 'object' && section.settings ? section.settings as Record<string, unknown> : {} } : null; }).filter(Boolean) as Array<{ type: HomeSectionType; name: string; visible: boolean; sortOrder: number; settings: Record<string, unknown> }> : [];
  return { theme, sections };
}
