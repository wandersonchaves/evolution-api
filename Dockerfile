FROM node:20-alpine AS builder

RUN apk update && \
    apk add --no-cache git ffmpeg wget curl bash openssl

LABEL version="2.3.0" description="Api to control whatsapp features through http requests." 
LABEL maintainer="Davidson Gomes" git="https://github.com/DavidsonGomes"
LABEL contact="contato@nextbot-api.com"

WORKDIR /nextbot

COPY ./package.json ./tsconfig.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./manager ./manager
COPY ./.env.example ./.env
COPY ./runWithProvider.js ./
COPY ./tsup.config.ts ./

COPY ./Docker ./Docker

RUN chmod +x ./Docker/scripts/* && dos2unix ./Docker/scripts/*

RUN ./Docker/scripts/generate_database.sh

RUN npm run build

FROM node:20-alpine AS final

RUN apk update && \
    apk add tzdata ffmpeg bash openssl

ENV TZ=America/Sao_Paulo

WORKDIR /nextbot

COPY --from=builder /nextbot/package.json ./package.json
COPY --from=builder /nextbot/package-lock.json ./package-lock.json

COPY --from=builder /nextbot/node_modules ./node_modules
COPY --from=builder /nextbot/dist ./dist
COPY --from=builder /nextbot/prisma ./prisma
COPY --from=builder /nextbot/manager ./manager
COPY --from=builder /nextbot/public ./public
COPY --from=builder /nextbot/.env ./.env
COPY --from=builder /nextbot/Docker ./Docker
COPY --from=builder /nextbot/runWithProvider.js ./runWithProvider.js
COPY --from=builder /nextbot/tsup.config.ts ./tsup.config.ts

ENV DOCKER_ENV=true

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", ". ./Docker/scripts/deploy_database.sh && npm run start:prod" ]