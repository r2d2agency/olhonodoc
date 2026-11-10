# Ativação do Mercado Pago — Procedimento do Admin

Este documento resume o que precisa ser feito no painel de administração para que o checkout com Pix, Cartão de crédito e Boleto do Mercado Pago funcione no site.

---

## 1. Onde fica a configuração

Acesse **Minha conta / Administração / Provedores de pagamento** (rota `PUT /api/admin/payment-providers`).

Os campos que o admin preenche:

| Campo | Descrição |
|-------|-----------|
| `activeProvider` | `mercadopago` (para ativar o MP) |
| `environment` | `sandbox` (testes) ou `production` (produção real) |
| `mercadopago.accessToken` | Token de acesso do MP (chave secreta, criptografada no banco) |
| `mercadopago.publicKey` | Chave pública do MP (usada no front para cartão) |
| `mercadopago.methods.card` | booleano — ativa cartão de crédito |
| `mercadopago.methods.pix` | booleano — ativa Pix |
| `mercadopago.methods.boleto` | booleano — ativa Boleto |

> **Importante:** o token (`accessToken`) é enviado criptografado. Somente salvar; o sistema descriptografa internamente ao chamar a API do MP.

---

## 2. Credenciais do Mercado Pago

O admin precisa gerar essas chaves na conta do Mercado Pago (https://www.mercadopago.com.br/developers):

| Ambiente | Onde pegar |
|----------|------------|
| Sandbox | Developers > Credenciais > "Credenciais de teste" |
| Produção | Developers > Credenciais > "Credenciais de produção" |

- **Access Token**: chave secreta (`access_token`). Colar no campo `mercadopago.accessToken`.
- **Public Key**: chave pública (`public_key`). Colar no campo `mercadopago.publicKey`.

---

## 3. Webhook do Mercado Pago (obrigatório)

O site precisa receber as notificações de pagamento do MP para aprovar o pedido automaticamente.

**URL do webhook a cadastrar no painel do Mercado Pago:**

```
https://olhonodoc.com/api/webhooks/mercadopago
```

**Eventos a habilitar:** `payment` (criado, aprovado, rejeitado, pendente).

O webhook já está implementado e valida a assinatura (`x-signature`) do Mercado Pago. Após salvar as credenciais no admin, cadastre essa URL no MP para que os pagamentos sejam confirmados no sistema.

---

## 4. Teste de conexão (antes de colocar no ar)

Existe um endpoint de teste que o admin pode usar para validar se as credenciais batem com a API do MP:

```
POST /api/admin/payment-providers/test
Body: { "provider": "mercadopago" }
```

O que ele faz: consulta `https://api.mercadopago.com/users/me` com o token configurado.

- Se retornar `connected: true`, as credenciais estão válidas.
- Se retornar `HTTP 401`, o token está errado ou expirado.

---

## 5. Teste de venda (sandbox)

1. No admin, defina `environment: sandbox`.
2. Vá ao site, inicie uma consulta e chegue na tela de pagamento.
3. Escolha **Pix** ou **Cartão de crédito**.
4. No MP sandbox, use cartões de teste (ex.: Visa 5031 4332 1539 0676, dados do desenvolvedor MP).
5. Confirme o pagamento no simulador do MP.
6. O pedido deve ir para `PAID` na área do cliente (`/minha-conta`).

---

## 6. Produção

1. No admin, defina `environment: production`.
2. Insira as credenciais de produção do MP.
3. Cadastre o webhook de produção (mesma URL, mas eventos da conta de produção).
4. Ative os métodos desejados (card, pix, boleto).
5. Faça um teste real com valor baixo ou use o modo de teste do MP em produção (se disponível).

---

## 7. Diagnóstico rápido

Endpoint para o admin verificar se tudo está OK no servidor:

```
GET /api/api/admin/diagnostics
```

Ele confere: banco de dados, schema do pagamento, credenciais configuradas e conexão com a API do MP.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| 404 nas rotas de checkout | Deploy desatualizado | Redploy para pegar as rotas novas |
| 401/403 no MP | Token errado ou ambiente errado | Revisar `accessToken` e `environment` |
| Pedido não aprova após pagamento | Webhook não cadastrado | Cadastrar URL do webhook no MP |
| Pix/boleto não aparecem | Métodos desligados no admin | Ativar `methods.pix` / `methods.boleto` |
