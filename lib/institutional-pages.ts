import { prisma } from '@/lib/prisma';

const KEY = 'institutional.pages';

export type InstitutionalPageKey = 'termos' | 'privacidade' | 'cookies' | 'sobre';

export const DEFAULT_PAGES: Record<InstitutionalPageKey, { title: string; content: string }> = {
  termos: {
    title: 'Termos de Uso',
    content: `<h2>1. Aceite dos termos</h2><p>Ao acessar e utilizar os serviços da Olho no Doc, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p><h2>2. Natureza das informações</h2><p>As consultas reunem e organizam informações obtidas em bases públicas e privadas disponíveis na data da pesquisa. Os dados têm caráter informativo e auxiliar.</p><h2>3. Uso adequado</h2><p>É vedado utilizar as informações para fins ilícitos, em desacordo com a legislação vigente ou que viole direitos de terceiros.</p><h2>4. Responsabilidade</h2><p>A Olho no Doc não substitui a verificação junto aos órgãos oficiais e não garante aprovação de seguros, financiamentos ou negociações.</p><h2>5. Contato</h2><p>Dúvidas podem ser enviadas pela página de contato do site.</p>`,
  },
  privacidade: {
    title: 'Política de Privacidade',
    content: `<h2>1. Dados coletados</h2><p>Coletamos dados informados por você (nome, e-mail, telefone, CPF e endereço), além de dados de navegação necessários ao funcionamento e à segurança da plataforma.</p><h2>2. Finalidade</h2><p>Os dados são usados para criar sua conta, processar pagamentos, realizar consultas e entregar relatórios.</p><h2>3. Compartilhamento</h2><p>Dados podem ser compartilhados com provedores de pagamento e com a Company Conferi exclusivamente para execução dos serviços contratados.</p><h2>4. Seus direitos</h2><p>Você pode solicitar acesso, correção ou exclusão dos seus dados pela página de contato.</p><h2>5. Segurança</h2><p>Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado.</p>`,
  },
  cookies: {
    title: 'Política de Cookies',
    content: `<h2>1. O que são cookies</h2><p>Cookies são pequenos arquivos armazenados no seu navegador para manter sessões e melhorar a experiência de uso.</p><h2>2. Cookies essenciais</h2><p>São necessários para manter você logado, processar pagamentos e proteger a plataforma contra abusos. Não podem ser desativados sem comprometer o funcionamento.</p><h2>3. Cookies de medição</h2><p>Podem ser utilizados para entender o uso do site somente após seu consentimento.</p><h2>4. Como gerenciar</h2><p>Você pode gerenciar suas preferências nas configurações do navegador.</p>`,
  },
  sobre: {
    title: 'Sobre a Olho no Doc',
    content: `<h2>Nossa proposta</h2><p>A Olho no Doc ajuda você a decidir com mais segurança antes de comprar, vender ou negociar um veículo. Reunimos informações de bases públicas e privadas em relatórios claros e objetivos.</p><h2>Como funciona</h2><p>Você informa a placa, escolhe a consulta adequada e recebe um laudo organizado com os principais apontamentos do veículo.</p><h2>Compromisso</h2><p>Tratamos seus dados com segurança e apresentamos as informações de forma transparente, sem substituir a verificação oficial junto aos órgãos competentes.</p>`,
  },
};

export async function getInstitutionalPages(): Promise<Record<InstitutionalPageKey, { title: string; content: string }>> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    const value = row?.value as Record<string, { title?: string; content?: string }> | undefined;
    if (!value) return DEFAULT_PAGES;
    const merged = { ...DEFAULT_PAGES };
    for (const k of Object.keys(DEFAULT_PAGES) as InstitutionalPageKey[]) {
      merged[k] = {
        title: typeof value[k]?.title === 'string' && value[k].title!.trim() ? value[k].title! : DEFAULT_PAGES[k].title,
        content: typeof value[k]?.content === 'string' && value[k].content!.trim() ? value[k].content! : DEFAULT_PAGES[k].content,
      };
    }
    return merged;
  } catch {
    return DEFAULT_PAGES;
  }
}

export async function saveInstitutionalPages(pages: Record<InstitutionalPageKey, { title: string; content: string }>) {
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: pages }, update: { value: pages } });
}
