import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { slug: 'consulta-premium', name: 'Consulta Premium', shortName: 'Premium', description: 'Uma visão mais completa do histórico do veículo antes da compra.', priceCents: 3990, accent: 'Destaque', features: ['Dados cadastrais', 'Leilão e sinistro', 'Roubo e furto', 'Restrições disponíveis'], useCase: 'Para quem está prestes a fechar negócio e quer reunir mais contexto sobre o veículo.' },
  { slug: 'consulta-essencial', name: 'Consulta Essencial', shortName: 'Essencial', description: 'As principais informações para começar sua análise.', priceCents: 1990, accent: null, features: ['Dados cadastrais', 'Roubo e furto', 'Identificação do veículo'], useCase: 'Para uma primeira triagem antes de avançar na negociação.' },
  { slug: 'roubo-furto', name: 'Dados Cadastrais + Roubo e Furto', shortName: 'Roubo e furto', description: 'Consulte dados cadastrais e informações disponíveis relacionadas a roubo ou furto.', priceCents: 1490, accent: null, features: ['Dados cadastrais', 'Roubo e furto', 'Status demonstrativo'], useCase: 'Para checar rapidamente sinais de alerta associados ao veículo.' },
  { slug: 'dados-veiculo', name: 'Dados Atuais do Veículo', shortName: 'Dados do veículo', description: 'Confira informações atuais e dados disponíveis relacionados ao veículo.', priceCents: 1290, accent: null, features: ['Marca e modelo', 'Ano e combustível', 'Localidade'], useCase: 'Para confirmar se os dados apresentados pelo vendedor fazem sentido.' },
  { slug: 'financiamento', name: 'Consulta de Financiamento', shortName: 'Financiamento', description: 'Consulte informações disponíveis relacionadas a financiamento do veículo.', priceCents: 1690, accent: null, features: ['Indícios disponíveis', 'Consulta por placa', 'Resultado demonstrativo'], useCase: 'Para investigar informações financeiras disponíveis antes de negociar.' }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  }
}

main().finally(() => prisma.$disconnect());