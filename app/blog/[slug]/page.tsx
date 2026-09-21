import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHero } from '@/components/page-blocks';
import { getPost, posts } from '@/data/blog';

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }
export async function generateMetadata({ params }: { params: { slug: string } }) { const post = getPost(params.slug); return post ? { title: post.title, description: post.excerpt } : {}; }

export default function ArticlePage({ params }: { params: { slug: string } }) { const article = getPost(params.slug); if (!article) notFound(); return <><PageHero eyebrow={`Conteúdos / ${article.category}`} title={article.title} description={article.excerpt}/><article className="article-body"><p className="article-meta">{article.date} · Equipe Olho no Doc</p><div className="article-layout"><aside><strong>Neste artigo</strong>{article.sections.map((section) => <a href={`#${section.heading.toLowerCase().replaceAll(' ', '-')}`} key={section.heading}>{section.heading}</a>)}</aside><div><div className="article-image"/>{article.sections.map((section) => <section key={section.heading}><h2 id={section.heading.toLowerCase().replaceAll(' ', '-')}>{section.heading}</h2><p>{section.body}</p></section>)}<Link className="button" href="/consultas">Ver consultas <span>→</span></Link></div></div></article></>; }
