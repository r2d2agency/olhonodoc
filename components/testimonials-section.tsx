import { Quote, Star } from 'lucide-react';
import { getTestimonials, youtubeId } from '@/lib/testimonials';

export default async function TestimonialsSection() {
  const items = await getTestimonials();
  if (!items.length) return null;
  return <section className="section testimonials-section" id="depoimentos">
    <div className="section-heading centered"><div><span className="eyebrow">QUEM CONSULTOU, APROVA</span><h2>Depoimentos de quem já usou.</h2><p>Experiências reais de pessoas que buscaram mais segurança antes de decidir.</p></div></div>
    <div className="testimonials-grid">{items.map(t => { const stars = Math.max(0, Math.min(5, Number(t.rating ?? 5))); const rating = <div className="testimonial-rating" aria-label={`${stars} de 5 estrelas`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} className={i < stars ? 'filled' : ''} fill={i < stars ? 'currentColor' : 'none'}/>)}<span>{stars}/5</span></div>; return t.type === 'video'
      ? <article className="testimonial-card testimonial-video" key={t.id}>
          {youtubeId(t.youtubeUrl || '') ? <div className="testimonial-video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId(t.youtubeUrl || '')}?rel=0&modestbranding=1&controls=1&showinfo=0`} title={`Depoimento de ${t.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"/></div> : null}
          <strong>{t.name}</strong>{rating}
        </article>
      : <article className="testimonial-card" key={t.id}>
          <Quote size={22}/><p>“{t.text}”</p>
          <div className="testimonial-person">{t.photoUrl ? <img src={t.photoUrl} alt={t.name}/> : <span>{t.name.slice(0, 1).toUpperCase()}</span>}<strong>{t.name}</strong></div>{rating}
        </article>; })}</div>
  </section>;
}
