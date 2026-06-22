# Stage 1: Instalar dependencias (incluye dev: necesarias para build y prisma generate)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build de la app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Genera el cliente Prisma (output custom en src/generated/prisma) y compila Next
RUN npx prisma generate
RUN npm run build

# Stage 3: Imagen de producción
FROM node:20-alpine AS runner
# libc6-compat + openssl: requeridos por el schema-engine de Prisma (migrate deploy)
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salida standalone de Next (server.js + assets)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schema + migraciones + config para `prisma migrate deploy` en el arranque
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# node_modules del builder: aporta el CLI de Prisma (migrate) y el runtime completo
# (@prisma/client, @prisma/adapter-pg, pg) por encima del node_modules mínimo del
# standalone. Garantiza que `migrate deploy` y el cliente funcionen en runtime.
COPY --from=builder /app/node_modules ./node_modules

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000

CMD ["./start.sh"]
