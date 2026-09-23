#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
	echo "Aviso: DATABASE_URL não configurada. O site público será iniciado, mas a API do banco não estará disponível."
else
	echo "Inicializando banco de dados..."
	DB_READY=0
	for attempt in 1 2 3 4 5; do
		echo "Aplicando schema Prisma (tentativa $attempt/5)..."
		if npx prisma db push --skip-generate; then
			DB_READY=1
			break
		fi
		echo "Banco ainda não disponível; aguardando 5 segundos..."
		sleep 5
	done
	if [ "$DB_READY" -ne 1 ]; then
		echo "ERRO: não foi possível aplicar o schema Prisma. A aplicação não será iniciada."
		exit 1
	fi
	npx prisma db seed || echo "Aviso: não foi possível executar o seed inicial."
fi

echo "Iniciando aplicação..."
exec node server.js