# Configurar o primeiro superadmin

O primeiro SUPERADMIN deve ser criado pelo terminal do serviço, com `DATABASE_URL` configurada:

```sh
ADMIN_NAME="Administrador" ADMIN_EMAIL="tnicodemos@gmail.com" ADMIN_PASSWORD="@N3tw0rk#" npm run db:create-admin
```

Depois, o acesso administrativo usa sempre o e-mail e a senha cadastrados. No painel, um SUPERADMIN pode cadastrar uma conta como `ADMIN`; a conta poderá então ser promovida explicitamente para `SUPERADMIN`.

O fluxo normal não depende de código OTP nem de `ADMIN_INVITE_CODE`.
