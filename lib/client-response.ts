/** Lê o corpo de uma resposta API com segurança.
 * Evita "Unexpected end of JSON input" quando o servidor responde 500/502/504 sem corpo. */
export async function readJson(response: Response): Promise<any> {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try { return JSON.parse(text); }
  catch { return {}; }
}
