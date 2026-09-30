import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/auth';
import { renderGoldPdf } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

const demoResponse = (plate: string): CompanyResponse => ({ solicitacao: { acao: 4, mensagem: 'Sistema Indisponível', dataHora: new Date().toLocaleString('pt-BR'), codigoConsulta: 'PREVIEW-GOLD', status: 'Em processamento' }, hashPesquisa: 'PREVIEW-TESTE', agregados: { consultaPor: 'placa', placa: plate, chassi: '9BWZZZ32ZGP246344', Uf: 'PR', municipio: 'LOBATO', marca: 'VW', modelo: 'SANTANA CG', cor: 'Vermelha', combustivel: 'Alcool', anoFabricacao: '1986', anoModelo: '1986', procedencia: 'Nacional', tipoVeiculo: 'Automóvel', especie: 'Passeio', potencia: '94', lotacao: '5', segmento: 'Auto', subSegmento: 'AU - SEDAN MEDIO', ultimaAtualizacao: '2007-12-11 00:00:00' }, bin: { mensagem: 'Sistema Indisponível' }, csv: { mensagem: 'Sistema Indisponível' }, historicoRouboFurto: { mensagem: 'Sistema Indisponível' }, estadual: { mensagem: 'Sistema Indisponível' }, gravame: { mensagem: 'Sistema Indisponível' }, sinistro: { mensagem: 'Sistema Indisponível' }, leilao: { mensagem: 'Sistema Indisponível' }, recall: { mensagem: 'Sistema Indisponível' } });

export async function POST(request: Request) {
  const user = await requireAdminAccess('OPERATIONAL');
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Informe uma placa válida.' }, { status: 400 });
  const supplied = body?.response;
  if (supplied !== undefined && (!supplied || typeof supplied !== 'object' || Array.isArray(supplied))) return NextResponse.json({ error: 'A resposta Company deve ser um objeto JSON.' }, { status: 400 });
  const suppliedRecord = supplied as Record<string, unknown> | undefined;
  const response = (suppliedRecord?.response && typeof suppliedRecord.response === 'object' && !Array.isArray(suppliedRecord.response) ? suppliedRecord.response : supplied || demoResponse(plate)) as CompanyResponse;
  const started = Date.now();
  try {
    const action = Number(response.solicitacao?.acao ?? suppliedRecord?.action);
    const status = action === 1 ? 'COMPLETED' : action === 4 ? 'PROCESSING' : 'PROCESSING';
    const previewMessage = supplied ? 'Pré-visualização com resposta fornecida pelo operador.' : 'Pré-visualização de teste — nenhuma consulta real foi realizada.';
    const pdf = await renderGoldPdf(response, plate, status, previewMessage);
    console.info('[company-preview] PDF generated', { plateLength: plate.length, suppliedResponse: Boolean(supplied), bytes: pdf.length, durationMs: Date.now() - started });
    return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="preview-pericia-${plate}.pdf"`, 'Cache-Control': 'no-store', 'X-Preview-Only': 'true' } });
  } catch (error) {
    console.error('[company-preview] PDF generation failed', { plateLength: plate.length, durationMs: Date.now() - started, error: error instanceof Error ? error.message : 'unknown error' });
    return NextResponse.json({ error: error instanceof Error ? `Não foi possível gerar o preview: ${error.message}` : 'Não foi possível gerar o preview.' }, { status: 500 });
  }
}
