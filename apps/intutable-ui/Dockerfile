# WARNING: You cannot run `docker build` from this directory!
# cd into the root directory and execute `docker build -t nextjs-docker -f ./apps/intutable-ui/Dockerfile .` from there
# this is because docker needs to copy files from there into the container
# unless you are not in that specific parent directory,
# docker will not be able to access the files to copy because it is outside of the context

# TODO: follow this guide https://turbo.build/repo/docs/handbook/deploying-with-docker

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat 
RUN apk update
WORKDIR /app

# Install dependencies
COPY ./apps/intutable-ui/package.json .
COPY ./package-lock.json .
RUN \
  if [ -f package-lock.json ]; then npm ci --audit false --fund false; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry collection
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Disable Next.js telemetry collection
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]