#!/bin/bash
set -e

# Instalar dependências da API
echo "Instalando dependências da API..."
cd api
npm install

# Voltar para a raiz
cd ..

# Instalar e buildar o frontend
echo "Instalando dependências do Frontend..."
cd frontend
npm install

echo "Buildando o Frontend..."
CI=false npm run build

# Confirmar que o diretório build existe
echo "Verificando diretório build..."
if [ -d "build" ]; then
  echo "Diretório build encontrado em $(pwd)/build"
  ls -la build
else
  echo "ERRO: Diretório build não encontrado!"
  exit 1
fi

echo "Build concluído com sucesso!" 