import { renderGoldPdf, goldReportHtml, reportHash } from '@/lib/gold-report';
import { renderGravamePdf, gravameReportHtml, gravameReportHash } from '@/lib/gravame-report';

/** HTML da consulta interna conforme o produto da consulta. */
export async function renderReportHtmlForProduct(options: {
  providerProduct: string | null | undefined;
  report: unknown;
  plate: string;
  status: string;
  message: string;
  customerName?: string | null;
}): Promise<string> {
  const { providerProduct, report, plate, status, message, customerName } = options;
  if (providerProduct === 'conferi-gravame') return gravameReportHtml(report, plate, customerName || undefined);
  return goldReportHtml(report as any, plate, status, message);
}

/** Escolhe o renderer correto conforme o produto da consulta. */
export async function renderReportForProduct(options: {
  providerProduct: string | null | undefined;
  report: unknown;
  plate: string;
  status: string;
  message: string;
  customerName?: string | null;
}): Promise<{ pdf: Buffer; hash: string }> {
  const { providerProduct, report, plate, status, message, customerName } = options;
  if (providerProduct === 'conferi-gravame') {
    const pdf = Buffer.from(await renderGravamePdf(report, plate, customerName || undefined));
    return { pdf, hash: gravameReportHash(pdf) };
  }
  const pdf = Buffer.from(await renderGoldPdf(report as any, plate, status, message));
  return { pdf, hash: reportHash(pdf) };
}
