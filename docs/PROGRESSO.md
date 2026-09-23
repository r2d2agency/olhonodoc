# Olho no Doc — Progresso do projeto

> Documento de controle do projeto. Atualizar este arquivo ao concluir cada tela, API ou integração. **Interface visual não significa fluxo pronto**: uma tela só é funcional quando possui fonte real, autorização, estados, validação, persistência e verificação end-to-end.

## Estado atual

- **Fase atual:** Fase 2 — expansão operacional/admin, em hardening e integração.
- **Próximo bloqueador:** Fase 3 — checkout, pagamento e execução real da consulta.
- **Stack:** Next.js 14 App Router, React 18, TypeScript, Prisma 6, PostgreSQL.
- **Baseline:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- **Testes automatizados:** não há test runner configurado.
- **Proteção admin:** `app/admin/layout.tsx` usa `requireAdmin`; mutações sensíveis devem usar `requireSuperadmin`.
- **Banco:** `prisma/schema.prisma`, cliente compartilhado em `lib/prisma.ts`.

## Legenda

- ✅ **Implementado/conectado:** fluxo real verificado ou API/fonte persistente existente.
- 🟡 **Parcial:** UI/API existe, mas há integração, persistência, autorização ou validação faltando.
- 🔴 **Pendente/placeholder:** tela genérica, dados fictícios ou fluxo não implementado.
- ⚠️ **A validar:** existe implementação, mas precisa de teste end-to-end antes de ser considerado pronto.

---

# Fase 0 — Fundação, contratos e qualidade

## Base existente

- ✅ Autenticação por senha/e-mail, sessão em cookie `olhonodoc_session`: `lib/auth.ts`, `app/api/auth/*`.
- ✅ Prisma/PostgreSQL e modelos centrais: `User`, `AuthCode`, `Session`, `Product`, `Customer`, `Order`, `Coupon`, `CouponAssignment`, `CouponRedemption`, `VehicleQuery`, `Article`, `FaqEntry`, `MarketingCampaign`, `Setting`, `HomeSection`.
- ✅ Componentes públicos: `components/site.tsx`, `components/legal.tsx`, `components/page-blocks.tsx`.
- ✅ Componentes admin: `components/admin-shell.tsx`, `components/admin-primitives.tsx`, `components/admin-panel.tsx`.
- ✅ Fallback de catálogo em `data/products.ts` e acesso centralizado em `lib/catalog.ts`.
- ✅ Configurações allowlisted em `Setting`, home CMS em `lib/home-cms.ts` e marca em `lib/brand.ts`.

## Pendências transversais

- 🟡 Criar matriz de ownership entre rota, tela, API, modelo e permissão.
- 🟡 Padronizar loading, vazio, erro, sucesso, não autorizado, offline, rascunho e publicado.
- 🟡 Remover arrays hardcoded de telas que prometem dados operacionais.
- 🟡 Padronizar paginação, filtros, moeda, datas, mensagens e validação server-side.
- 🟡 Criar observabilidade/auditoria para mutações, checkout, provedor, SMTP e ações administrativas.
- 🟡 Validar responsividade, acessibilidade, foco, teclado e ausência de overflow.
- 🟡 Criar testes automatizados ou ao menos testes de contrato para APIs críticas.

**Definition of Done:** `tsc`, lint e build passam; nenhum link do sidebar finge ser funcional; toda mutação tem autorização, confirmação quando destrutiva e feedback.

---

# Fase 1 — Site público e aquisição

## Páginas públicas

- 🟡 `/` — `app/page.tsx`: home visual completa com hero, placa, benefícios, produtos, FAQ, relatório e CTA; conteúdo ainda majoritariamente hardcoded e não totalmente controlado pelo Home CMS.
- 🟡 `/consultas` — catálogo com `lib/catalog.ts` e fallback; validar somente produtos ativos e CTA para checkout.
- 🟡 `/consultas/[slug]` — detalhe dinâmico com `ProductDetail`; validar slug, produto inativo, preço e features da fonte única.
- 🟡 `/comparar-consultas` — comparação visual; confirmar preços/features centralizados e CTA com placa.
- 🟡 `/precos` — preços visuais; eliminar divergência com catálogo/admin.
- ✅/🟡 `/como-funciona`, `/sobre`, `/exemplo-relatorio` — conteúdo público; validar SEO e links.
- 🟡 `/faq` — página pública existe; publicação e fonte persistente precisam ser conectadas ao CMS.
- 🟡 `/contato` — página existe; confirmar endpoint, anti-spam, feedback e logging.
- 🟡 `/blog`, `/blog/[slug]` — páginas existem; conteúdo público ainda usa `data/blog.ts` enquanto CMS persistente precisa ser fonte principal.
- 🟡 `/termos-de-uso`, `/politica-de-privacidade`, `/politica-de-cookies`, `/politica-de-reembolso` — existem; revisar conteúdo para checkout, cookies, placa, CPF/e-mail, LGPD e provedores.
- 🟡 Metadata, canonical, sitemap, robots, favicon e links públicos — revisar tela a tela.

**Conclui quando:** conteúdo publicado no CMS aparece no público, fallback funciona sem banco, CTA preserva placa, catálogo é fonte única, SEO/acessibilidade/mobile estão validados.

---

# Fase 2 — Identidade, autenticação e portal do cliente

- ✅ `/login` — login/registro e sessão; validar rate limit, mensagens neutras, `next` seguro e logout.
- 🟡 `/recuperar-senha` — fluxo existe e depende de SMTP; testar expiração, uso único, rate limit e falha de envio.
- 🟡 `/redefinir-senha` — validar token, troca de senha e invalidação de sessões antigas.
- 🟡 `/minha-conta` — `portal.tsx` possui visão geral, veículos e consultas, mas checkout, veículos, pedidos, consultas e relatórios ainda não estão plenamente conectados.
- ✅ `/admin/usuarios` — listagem/criação/promoção/exclusão via APIs; faltam convite, desativação, sessões, RBAC granular e proteção da última conta.
- ✅ `/admin/configuracoes` — SMTP testado; ainda requer tratamento operacional de demais settings e secrets.

**Conclui quando:** cliente vê apenas os próprios dados, sessão e reset são seguros, e portal mostra pedidos/veículos/consultas/relatórios reais.

---

# Fase 3 — Fluxo principal: consulta, checkout, pagamento e laudo

## Fluxo de negócio confirmado

O produto terá duas portas de entrada para a compra, com o mesmo checkout e a mesma área do cliente:

### Entrada A — Landing page / Hero

1. No hero da landing page, o visitante informa a placa.
2. O sistema valida e normaliza a placa.
3. A placa é enviada à integração da **Company Conferi** para consulta básica/agregada.
4. A resposta inicial mostra somente dados básicos autorizados, como marca, modelo e cor.
5. A página exibe o aviso/CTA de que o laudo completo exige uma consulta paga.
6. O visitante é direcionado à página de planos, levando a placa e a origem da campanha.
7. Ele escolhe o plano/consulta, compara diferenças, recursos e preço.

### Entrada B — Área do cliente

1. Cliente autenticado acessa `/minha-conta`.
2. Pode informar uma nova placa ou escolher veículo já salvo.
3. Visualiza planos, consultas, pacotes, ofertas e preços disponíveis.
4. Escolhe a consulta e segue para o mesmo checkout da entrada A.
5. Após a compra, o pedido aparece na área do cliente e o cliente pode adquirir novas consultas.

### Checkout e criação da conta

1. O checkout recebe placa, produto e cupom, mas nunca confia no total enviado pelo navegador.
2. O visitante preenche nome, e-mail, dados necessários e cria a senha nessa etapa; se já possuir conta, autentica-se.
3. O servidor cria/associa a conta, cliente, veículo e pedido em transação segura.
4. O gateway processa o pagamento online.
5. O cliente vê sucesso, pendência ou falha e retorna para sua área.

### Pós-pagamento e segunda confirmação da placa

1. O pagamento confirmado deixa a consulta como `PENDENTE`/`AGUARDANDO_PROCESSAMENTO` na área do cliente.
2. O sistema confirma novamente a placa antes de consumir a consulta paga.
3. A placa é enviada à Company Conferi pelo adapter de integração.
4. Deve existir webhook/callback autenticado para a Company Conferi informar o processamento.
5. Quando pronta, a Company Conferi retorna um JSON completo.
6. O sistema valida, normaliza e armazena o JSON sem expor payload sensível.
7. O JSON normalizado alimenta a tela do laudo e a geração de PDF.
8. O cliente visualiza o status e baixa o PDF autorizado na área do cliente.
9. Falhas, timeout e indisponibilidade geram retry controlado e estado visível, sem duplicar a consulta.

## Telas e integrações necessárias

- 🟡 Hero/landing: placa, consulta básica/agregada, aviso de laudo completo e encaminhamento aos planos.
- 🟡 Página de planos: comparação, recursos, preço, pacote/oferta e preservação da placa.
- 🔴 Checkout: dados pessoais, criação de conta/senha, cupom, resumo, pagamento e estados de retorno.
- 🟡 `/minha-conta`: nova aquisição, veículos, consultas pendentes/concluídas, ofertas, pacotes e preços.
- 🔴 `/admin/integracoes`: configuração segura da Company Conferi, credenciais, endpoint, webhook, health check e teste.
- 🔴 Webhook Company Conferi: autenticação, idempotência, validação de assinatura, correlação pedido/consulta e armazenamento do retorno.
- 🔴 Laudo: visualização do JSON normalizado e geração/download de PDF.
- 🟡 `/admin/consultas`: fila, status, payload sanitizado, retry, erro, SLA e reprocessamento manual.
- 🟡 `/admin/pedidos` e `/admin/pagamentos`: reconciliação entre pedido, pagamento e consulta.

## Estados sugeridos

`DRAFT` → `AWAITING_PAYMENT` → `PAID` → `PLATE_CONFIRMATION_PENDING` → `SUBMITTED_TO_PROVIDER` → `PROCESSING` → `COMPLETED` → `REPORT_AVAILABLE`.

Estados de exceção: `PAYMENT_FAILED`, `CANCELLED`, `PROVIDER_TIMEOUT`, `PROVIDER_ERROR`, `REPORT_FAILED`.

Cada transição deve ser autorizada, registrada e idempotente.

## Lacuna principal

🔴 Existe `POST /api/checkout/validate-coupon`, mas ainda não existe o fluxo completo de consulta básica/agregada, criação de conta no checkout, criação de pedido, cobrança, webhook, confirmação de placa, integração Company Conferi ou entrega de PDF.

## Entregas

1. Tela de checkout: cliente, placa, produto, cupom, resumo, termos e pagamento.
2. Criar pedido em transação; servidor recalcula produto, desconto e total.
3. Integração de gateway (PIX/cartão conforme decisão do produto).
4. Webhook autenticado e idempotente: aprovado, pendente, recusado, cancelado e estornado.
5. Resgatar cupom somente em pagamento confirmado, sem duplicidade.
6. Tela de sucesso, pendência e falha.
7. Adapter de fornecedor de consulta, fila/worker, retry/backoff, timeout e normalização.
8. Armazenar resultado/relatório seguro e disponibilizar no portal.

**Conclui quando:** retry não duplica pedido/cobrança/consulta; estados são auditáveis; pagamento aprovado gera no máximo uma consulta; cliente acessa apenas seu relatório.

---

# Fase 4 — Admin operacional conectado

- 🟡 `/admin` — dashboard visual com KPIs/funil e ações pendentes; valores precisam vir de agregações reais, não constantes.
- 🟡 `/admin/produtos`, `/admin/produtos/novo`, `/admin/produtos/[slug]` — APIs/listagem existem; edição/publicação/preview e alguns botões em `app/admin/admin-pages.tsx` precisam persistência real.
- ✅/🟡 `/admin/pedidos` — API real e atualização de status; validar máquina de estados, paginação, auditoria e ligação ao pagamento.
- 🟡 `/admin/pagamentos` — tela existe; integrar transações, gateway, tentativas, webhook, estorno e conciliação.
- 🟡 `/admin/consultas` — API/tela preparadas; integrar provider, status, retry, SLA e resultado.
- 🟡 `/admin/clientes` — validar se dados vêm da API real; adicionar perfil, pedidos, consultas, veículos, consentimentos e permissões.
- 🟡 `/admin/leads` — API existe; validar persistência, origem, consentimento, segmentação e ações.
- 🟡 `/admin/carrinhos-abandonados`, `/admin/recuperacoes` — telas/APIs existem; ligar a eventos reais e opt-out.
- 🟡 `/admin/fornecedores` — tela/API existem; faltam credenciais seguras, health check, custos, limites, SLA e fallback.

**Conclui quando:** dashboard reconcilia com pedidos/consultas, telas usam fonte real, filtros/paginação funcionam, e cada transição é autorizada e auditada.

---

# Fase 5 — CMS, marca e mídia

- 🟡 `/admin/site/home` — `HomeSection`, `app/api/admin/home/route.ts` e `lib/home-cms.ts` existem; completar CRUD de blocos, ordenação persistente, draft/publicado, preview e rollback.
- 🔴 `/admin/site/paginas` — interface estática em `admin-pages.tsx`; definir modelo ou assumir páginas em código, e implementar editor/SEO/publicação.
- 🔴 `/admin/site/menu` — interface estática; persistir hierarquia, ordem, links, visibilidade e mobile.
- 🔴 `/admin/site/rodape` — sidebar aponta, mas cai no fallback placeholder.
- 🔴 `/admin/site/banners` — sidebar aponta, mas cai no fallback placeholder.
- 🟡 `/admin/site/midias` — API/UI existem; completar upload, limites, metadados, remoção, referências e otimização.
- 🟡 `/admin/marca` — configuração `brand` existe; validar save, preview, contraste, logo e fallback público.
- 🟡 `/admin/blog` e `/admin/faq` — CRUD/API existe, mas revisar publicação pública, slug, SEO, imagens, ordenação e schema.org.

**Conclui quando:** conteúdo editado aparece no público, sem arrays duplicados, com rascunho/publicação e fallback controlado.

---

# Fase 6 — Marketing, SEO e relatórios

As rotas abaixo são anunciadas no sidebar, mas muitas caem em `app/admin/[...slug]/page.tsx` e `AdminPlaceholderPage`:

- 🔴 `/admin/caracteristicas`
- 🔴 `/admin/precos`
- 🔴 `/admin/categorias`
- 🔴 `/admin/campanhas`
- 🔴 `/admin/utms`
- 🔴 `/admin/templates`
- 🔴 `/admin/automacoes`
- 🔴 `/admin/seo`, `/admin/seo/redirecionamentos`, `/admin/seo/scripts`
- 🔴 `/admin/relatorios/funil`, `/admin/relatorios/conversao`
- 🔴 `/admin/permissoes`
- 🔴 `/admin/integracoes`
- 🔴 `/admin/logs`

## Entregas

Categorias e conteúdo; campanhas/UTM e atribuição; templates transacionais; automações com retry/opt-out; SEO, redirects, scripts/pixels com consentimento; relatórios alimentados por eventos; RBAC por módulo; integrações com health status; auditoria pesquisável sem secrets/PII desnecessária.

**Conclui quando:** nenhum placeholder é apresentado como pronto e cada módulo tem rota, API, autorização, estados, validação e persistência.

---

# Fase 7 — Segurança, operação e produção

- 🟡 Validar guards endpoint por endpoint e separação ADMIN/SUPERADMIN.
- 🟡 LGPD: minimização, consentimento, retenção, exportação e exclusão.
- 🟡 Rate limit para login, OTP, reset, contato e SMTP test.
- 🟡 Logs estruturados, correlation ID, auditoria e redaction de secrets.
- 🟡 Backups/restauração PostgreSQL, health checks e alertas.
- 🟡 Segurança de upload/data URLs e imagens.
- 🟡 Performance, acessibilidade, SEO, mobile e cache.
- 🟡 Testes E2E dos fluxos críticos: login, reset, admin, produto, cupom, checkout, pagamento, consulta e relatório.

---

# Inventário técnico

## APIs existentes

- Auth: `/api/auth/login`, `register`, `request-code`, `verify-code`, `logout`, `forgot-password`, `reset-password`.
- Público: `GET /api/products`, `GET /api/products/[slug]`, `POST /api/checkout/validate-coupon`.
- Admin catálogo: `/api/admin/products`, `/api/admin/products/[slug]`, `/api/admin/coupons`, `/api/admin/coupons/[id]`.
- Admin operação: `/api/admin/orders`, `queries`, `leads`, `recovery`, `suppliers`.
- Admin CMS/config: `/api/admin/home`, `content`, `content/[id]`, `media`, `settings`.
- Admin usuários: `/api/admin/users`, `/api/admin/users/[id]`.

## Arquivos de referência

- `CLAUDE.md` — arquitetura e comandos.
- `docs/admin-setup.md` — criação do primeiro SUPERADMIN.
- `prisma/schema.prisma` — contratos persistentes.
- `app/admin/placeholder-pages.ts` — mapa de placeholders.
- `app/admin/[...slug]/page.tsx` — fallback dinâmico.
- `app/admin/admin-pages.tsx` — concentração de telas demonstrativas.
- `lib/catalog.ts`, `lib/home-cms.ts`, `lib/brand.ts`, `lib/auth.ts`, `lib/email.ts`, `lib/smtp-settings.ts`.

# Ordem recomendada para continuar

1. Fase 0: baseline, matriz de rotas, autorização, estados e observabilidade.
2. Fase 3: checkout mínimo, pedido, cupom, pagamento/webhook.
3. Consulta real: provider, fila, relatório e portal.
4. Fase 4: admin transacional e dashboard real.
5. Fase 5: CMS público conectado e conteúdo persistente.
6. Fase 6: marketing, SEO, relatórios, permissões, integrações e logs.
7. Fase 7: hardening, LGPD, backups, performance e E2E.

# Registro de execução

| Data | Fase | Entrega | Status |
|---|---|---|---|
| 2026-09-23 | Fase 2 | Configuração SMTP, diagnóstico TLS e fallback | ✅ concluído |
| 2026-09-23 | Roadmap | Inventário completo inicial salvo neste arquivo | ✅ concluído |
| 2026-09-23 | Fase 3 | Fluxo confirmado: hero → consulta básica Company Conferi → planos → checkout/criação de conta → pagamento → webhook → laudo PDF → área do cliente | 🟡 especificado |

## Regra para próximas alterações

Antes de implementar qualquer tela, ler este arquivo e atualizar a linha correspondente. Depois de concluir, registrar arquivos alterados, teste executado e pendências restantes.
