import { prisma } from '@/lib/prisma';

const KEY = 'site.testimonials';

export type Testimonial = {
  id: string;
  type: 'text' | 'video';
  name: string;
  text: string;
  photoUrl?: string;
  youtubeUrl?: string;
  active: boolean;
  sortOrder: number;
  rating: number;
};

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 'demo-1', type: 'text', name: '', text: '', active: false, sortOrder: 1, rating: 5 },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    const value = row?.value;
    const list = Array.isArray(value) ? (value as unknown[]) : [];
    if (list.length) return list.filter((t): t is Record<string, any> => Boolean(t) && typeof t === 'object' && !Array.isArray(t) && (t as Record<string, any>).active !== false).map(t => ({
      id: String(t.id || ''), type: t.type === 'video' ? 'video' as const : 'text' as const, name: String(t.name || ''),
      text: String(t.text || ''), photoUrl: String(t.photoUrl || ''), youtubeUrl: String(t.youtubeUrl || ''),
      active: t.active !== false, sortOrder: Number(t.sortOrder || 0),
      rating: Math.max(0, Math.min(5, Number(t.rating ?? 5))),
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch { /* fallback */ }
  return [];
}

export async function saveTestimonials(items: Testimonial[]) {
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: items }, update: { value: items } });
}

/** Converte URL do YouTube para ID de vídeo (embed sem marca). */
export function youtubeId(url: string): string {
  const s = String(url || '').trim();
  let id = '';
  const watch = s.match(/[?&]v=([^&#]+)/);
  if (watch) id = watch[1];
  else if (/youtu\.be\//.test(s)) id = s.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
  else if (/youtube\.com\/embed\//.test(s)) id = s.split('/embed/')[1]?.split(/[?#]/)[0] || '';
  else if (/youtube\.com\/shorts\//.test(s)) id = s.split('/shorts/')[1]?.split(/[?#]/)[0] || '';
  return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';
}
