# Roadmap de implementação — Olho no Doc

Arquivo de acompanhamento do trabalho de conclusão do sistema. Marque cada tarefa apenas depois de validar a implementação e registre o commit correspondente.

## Fase 0 — Baseline e qualidade

- [x] Criar roadmap persistente no repositório.
- [ ] Confirmar estado do Git, TypeScript e build.
- [ ] Separar correções existentes de novas funcionalidades.
- [ ] Definir ambiente de teste e dados mínimos não produtivos.
- [ ] Padronizar erros, loading, autorização e logs.

**Registro**
- Data: 2026-09-28
- Commit: pendente
- Testes: arquivo criado; validação geral ainda pendente.
- Pendências: executar baseline antes de iniciar pagamentos.

## Fase 1 — Pagamentos

- [ ] Definir interface comum para Mercado Pago e Asaas.
- [ ] Implementar criação de checkout/preferência.
- [ ] Criar fluxo público a partir do pedido PENDING.
- [ ] Persistir identificador externo e status.
- [ ] Implementar idempotência.
- [ ] Testar Mercado Pago em sandbox.
- [ ] Testar Asaas em sandbox.

## Fase 2 — Webhooks de pagamento

- [ ] Webhook Mercado Pago com validação.
- [ ] Webhook Asaas com validação.
- [ ] Processamento idempotente.
- [ ] Estados aprovado, pendente, cancelado, expirado, estornado e chargeback.
- [ ] Atualizar pedido para PAID somente após confirmação.
- [ ] Auditoria sem dados sensíveis.

## Fase 3 — Company Conferi pós-pagamento

- [ ] Disparar consulta somente após PAID.
- [ ] Usar `providerProduct` do produto.
- [ ] Persistir request, resposta, código, hash, status e tentativas.
- [ ] Retry limitado para falhas transitórias.
- [ ] Reconsulta/webhook idempotente.
- [ ] Testar Premium → Agregados → placa.

## Fase 4 — Portal e relatórios

- [ ] Mostrar status real do pedido e consulta.
- [ ] Mostrar relatório completo de Agregados sem dados indevidos.
- [ ] Criar visualização de relatório.
- [ ] Corrigir estados de processamento, erro e sem dados.
- [ ] Garantir vínculo seguro User/Customer/Order.

## Fase 5 — Tracking, pixels e atribuição

- [ ] Persistir UTM, gclid e fbclid no pedido/lead.
- [ ] Ligar eventos reais do funil.
- [ ] Disparar `purchase` apenas após PAID.
- [ ] Eventos Company iniciada/concluída.
- [ ] Deduplicação com `event_id`.
- [ ] Configurar Meta, GA4 e Google Ads.
- [ ] Relatório de funil com dados reais.

## Fase 6 — Carrinho abandonado e automações

- [ ] Definir abandono de pedido PENDING.
- [ ] Mostrar etapa e atribuição.
- [ ] Recuperar link sem duplicidade.
- [ ] Integrar templates de mensagem.
- [ ] Opt-out e consentimento de comunicação.
- [ ] Histórico de automações.

## Fase 7 — SEO e marketing

- [ ] SEO global.
- [ ] Metadata, canonical, robots, sitemap e JSON-LD.
- [ ] Redirects no runtime.
- [ ] CRUD e relatório de campanhas/UTMs.
- [ ] Templates e automações finais.

## Fase 8 — Segurança e operação

- [ ] Rate limiting.
- [ ] CSP e headers.
- [ ] Sanitização de scripts.
- [ ] Validação de payloads.
- [ ] Redação de dados sensíveis nos logs.
- [ ] Revisão de sessões e permissões.
- [ ] Backup e retenção.
- [ ] Monitoramento.

## Fase 9 — UX e mobile

- [ ] Revisar admin tela por tela.
- [ ] Revisar Minha Conta com fonte mínima mobile de 14px.
- [ ] Revisar checkout mobile.
- [ ] Padronizar loading, erro, vazio e sucesso.
- [ ] Acessibilidade e foco.
- [ ] Testar 320, 375, 768, 1024 e desktop.

## Fase 10 — Homologação e produção

- [ ] `npx prisma generate`.
- [ ] Migração conforme política do projeto.
- [ ] `npx tsc --noEmit`.
- [ ] `npm run build`.
- [ ] E2E pagamento → webhook → Company → relatório.
- [ ] Replay e rollback de webhook.
- [ ] Variáveis e URLs de produção.
- [ ] Deploy controlado.
- [ ] Smoke test produtivo.

## Registro de ciclos

Use este espaço para registrar data, commit, arquivos principais, comandos/testes, resultado e pendências de cada ciclo.
