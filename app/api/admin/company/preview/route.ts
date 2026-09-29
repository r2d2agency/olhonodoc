import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/auth';
import { renderGoldPdf } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export async function POST(request: Request) {
  const user = await requireAdminAccess('OPERATIONAL');
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Informe uma placa válida.' }, { status: 400 });
  const response: CompanyResponse = { solicitacao: { acao: 4, mensagem: 'Sistema Indisponível', dataHora: new Date().toLocaleString('pt-BR'), codigoConsulta: 'TESTE-PERICIA-GOLD', status: 'Em processamento' }, hashPesquisa: 'PREVIEW-TESTE', agregados: { consultaPor: 'placa', placa: plate, chassi: '9BWZZZ32ZGP246344', Uf: 'PR', municipio: 'LOBATO', marca: 'VW', modelo: 'SANTANA CG', cor: 'Vermelha', combustivel: 'Alcool', anoFabricacao: '1986', anoModelo: '1986', procedencia: 'Nacional', tipoVeiculo: 'Automóvel', especie: 'Passeio', potencia: '94', lotacao: '5', segmento: 'Auto', subSegmento: 'AU - SEDAN MEDIO', ultimaAtualizacao: '2007-12-11 00:00:00' }, bin: { mensagem: 'Sistema Indisponível' }, csv: { mensagem: 'Sistema Indisponível' }, historicoRouboFurto: { mensagem: 'Sistema Indisponível' }, estadual: { mensagem: 'Sistema Indisponível' }, gravame: { mensagem: 'Sistema Indisponível' }, sinistro: { mensagem: 'Sistema Indisponível' }, leilao: { mensagem: 'Sistema Indisponível' }, recall: { mensagem: 'Sistema Indisponível' } };
  try { const pdf = await renderGoldPdf(response, plate, 'PROCESSING', 'Pré-visualização de teste — nenhuma consulta real foi realizada.'); return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="preview-pericia-${plate}.pdf"`, 'Cache-Control': 'no-store', 'X-Preview-Only': 'true' } }); } catch { return NextResponse.json({ error: 'Não foi possível gerar o preview.' }, { status: 500 }); }
}
