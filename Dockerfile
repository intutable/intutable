# This is a multistage Docker-image

# Install dependencies when needed
FROM node:lts-alpine AS deps

#https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# This MIGHT be needed
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Rebuild the source code when needed
FROM node:lts-alpine AS builder

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image, copy everything and run next
FROM node:lts-alpine AS runner

WORKDIR /app

# Change when needed
ENV NODE_ENV production

# This is only needed when custom config files are used => change when needed
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/src/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000

# Disable telemetry => might not be needed so chang eif neccessary
RUN npx next telemetry disable

CMD ["node_modules/.bin/next", "start"]
