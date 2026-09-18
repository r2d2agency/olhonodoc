#!/bin/sh
set -e

echo "Inicializando banco de dados..."
npx prisma db push --skip-generate
npx prisma db seed

echo "Iniciando aplicação..."
exec node server.js