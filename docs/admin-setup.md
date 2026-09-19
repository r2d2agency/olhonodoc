# Criar o superadmin

O projeto não expõe uma rota pública para promover usuários. O primeiro superadmin deve ser criado pelo terminal do serviço no EasyPanel, com `DATABASE_URL` configurada:

```sh
ADMIN_NAME="Administrador" ADMIN_EMAIL="admin@seudominio.com" ADMIN_PASSWORD="troque-por-uma-senha-com-12-caracteres" npm run db:create-admin
```

O comando cria o usuário ou atualiza o usuário existente com esse e-mail para `SUPERADMIN`. A senha é armazenada somente como hash.

Esta etapa cria o registro para a futura autenticação. O login e a área administrativa ainda precisam ser implementados antes de o usuário conseguir entrar na plataforma.