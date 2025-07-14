# Etapa de build
FROM node:20-alpine AS builder

# Atualiza repositórios e instala pacotes em blocos menores para evitar OOM
RUN apk update && apk add --no-cache \
    bash \
    openssl \
    && apk add --no-cache ffmpeg \
    && apk add --no-cache tzdata \
    && apk add --no-cache git curl wget

# Define diretório de trabalho
WORKDIR /evolution

# Copia arquivos essenciais (INCLUI package-lock.json!)
COPY ./package.json ./package-lock.json ./tsconfig.json ./

# Instala dependências de forma confiável com base no lockfile
RUN npm ci

# Copia o restante dos arquivos do projeto
COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./manager ./manager
COPY ./.env.example ./.env
COPY ./runWithProvider.js ./
COPY ./tsup.config.ts ./
COPY ./Docker ./Docker

# Permissões e normalização de scripts
RUN chmod +x ./Docker/scripts/* && dos2unix ./Docker/scripts/*

# Gera banco de dados (se necessário)
RUN ./Docker/scripts/generate_database.sh

# Build final do código TypeScript
RUN npm run build

# Etapa final (imagem mais enxuta para produção)
FROM node:20-alpine AS final

RUN apk update && apk add --no-cache \
    tzdata \
    ffmpeg \
    bash \
    openssl

ENV TZ=America/Sao_Paulo

WORKDIR /evolution

# Copia os arquivos necessários da imagem builder
COPY --from=builder /evolution/package.json ./package.json
COPY --from=builder /evolution/package-lock.json ./package-lock.json
COPY --from=builder /evolution/node_modules ./node_modules
COPY --from=builder /evolution/dist ./dist
COPY --from=builder /evolution/prisma ./prisma
COPY --from=builder /evolution/manager ./manager
COPY --from=builder /evolution/public ./public
COPY --from=builder /evolution/.env ./.env
COPY --from=builder /evolution/Docker ./Docker
COPY --from=builder /evolution/runWithProvider.js ./runWithProvider.js
COPY --from=builder /evolution/tsup.config.ts ./tsup.config.ts

ENV DOCKER_ENV=true

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", ". ./Docker/scripts/deploy_database.sh && npm run start:prod" ]