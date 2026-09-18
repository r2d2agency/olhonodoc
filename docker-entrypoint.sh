#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
	echo "Aviso: DATABASE_URL não configurada. O site público será iniciado, mas a API do banco não estará disponível."
else
	echo "Inicializando banco de dados..."
	if npx prisma db push --skip-generate; then
		npx prisma db seed || echo "Aviso: não foi possível executar o seed inicial."
	else
		echo "Aviso: não foi possível conectar ao banco. O site público será iniciado mesmo assim."
	fi
fi

echo "Iniciando aplicação..."
exec node server.js