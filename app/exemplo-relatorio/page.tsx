import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Exemplo de relatório', alternates: { canonical: '/exemplo-relatorio' } };
import { PageHero } from '@/components/page-blocks';
import { ReportPreview } from '@/components/site';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ReportPage() {
  const row = await prisma.setting.findUnique({ where: { key: 'site.exampleReport' } }).catch(() => null);
  const value = row?.value as { dataUrl?: string } | undefined;
  const pdfUrl = value?.dataUrl?.startsWith('data:application/pdf;base64,') ? '/api/public/example-report' : '';
  return <>
    <PageHero eyebrow="Demonstração" title="Veja um exemplo de consulta Olho no Doc." description="Explore uma prévia do relatório e entenda como as informações são organizadas. Todos os dados são fictícios."/>
    <section className="section full-report">
      {pdfUrl ? <div className="example-pdf-viewer"><iframe src={pdfUrl} title="Exemplo de relatório em PDF"/><Link className="button" href={pdfUrl} target="_blank" rel="noopener">Abrir PDF em nova aba <ArrowRight size={16}/></Link></div> : <>
        <div className="report-label">DADOS DEMONSTRATIVOS · ABC1D23</div><ReportPreview/>
      </>}
      <div className="report-detail-grid"><div><span className="eyebrow">Resumo da consulta</span><h2>Um resultado que ajuda você a fazer as perguntas certas.</h2></div><div><p>O relatório pode apresentar dados cadastrais, apontamentos e informações disponíveis para a consulta escolhida. A disponibilidade varia conforme o produto.</p><Link className="button" href="/consultas">Consultar outro veículo <ArrowRight size={16}/></Link></div></div>
    </section>
  </>;
}