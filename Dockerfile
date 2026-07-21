# syntax=docker/dockerfile:1

#####################################
# 1. deps: install dependencies only
#####################################
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat is recommended by Next.js for Alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

#####################################
# 2. builder: generate Prisma client and build the Next.js app
#####################################
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client must be generated before `next build` since there is
# no postinstall hook wired up for it in package.json.
RUN npx prisma generate

# Dummy build-time env vars — no real secrets are required to produce
# a production build; runtime secrets are supplied via the container's
# actual environment when the image is run.
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sehat_saheli"
ENV AUTH_SECRET="build-time-placeholder-secret"
ENV NEXTAUTH_SECRET="build-time-placeholder-secret"

RUN npm run build

#####################################
# 3. runner: minimal production image
#####################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for running the app
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output: server bundle + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema + generated client are needed at runtime for migrations/queries
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
