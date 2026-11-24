/** Nome do arquivo PDF conforme o produto da consulta. */
export function reportFileName(providerProduct: string | null | undefined, plate: string, timestamp = Date.now()): string {
  const prefix = providerProduct === 'conferi-auto-veiculo' ? 'consulta-essencial'
    : providerProduct === 'conferi-gravame' ? 'consulta-gravame'
    : providerProduct === 'conferi-bin' ? 'consulta-bin-rf'
    : providerProduct === 'conferi-estadual' ? 'consulta-estadual'
    : providerProduct === 'conferi-crlv' ? 'consulta-crlv'
    : providerProduct === 'conferi-agregados' ? 'consulta-agregados'
    : 'consulta';
  const cleanPlate = String(plate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${prefix}-${cleanPlate}-${timestamp}.pdf`;
}
