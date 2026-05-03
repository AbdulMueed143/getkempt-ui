# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# Get Kempt — Frontend Dockerfile
#
# Multi-stage build:
#   1. deps   — install npm dependencies (cached separately)
#   2. build  — compile the Next.js app into a static `out/` bundle
#   3. runner — serve the static bundle with nginx-alpine
#
# Final image is ~25 MB and contains NO Node runtime, which dramatically
# shrinks the production attack surface.
#
# ─── If you ever add server-side routes, API routes or middleware ──────────
# … remove `output: "export"` from next.config.ts and switch the runner stage
# to `node:22-alpine` running `node server.js` against the standalone output.
# Notes are inline below.
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.27-alpine

# ─────────────────────────────────────────────
# 1. deps — install npm dependencies
# ─────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# libc6-compat is required for some native deps (esp. on Apple Silicon)
RUN apk add --no-cache libc6-compat

# Copy lockfile + manifest first so docker can cache `npm ci` between builds
COPY package.json package-lock.json* ./
# `npm ci` is reproducible & faster than `npm install` in CI
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund


# ─────────────────────────────────────────────
# 2. build — compile the Next.js app
# ─────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build
WORKDIR /app

# Pull pre-installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js anonymous telemetry in CI
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build-time public env vars must be passed as `--build-arg`s
# (they get baked into the static bundle).
ARG NEXT_PUBLIC_BASE_PATH=""
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build


# ─────────────────────────────────────────────
# 3. runner — serve static bundle with nginx
# ─────────────────────────────────────────────
FROM nginx:${NGINX_VERSION} AS runner

# Drop privileges — nginx already runs workers as `nginx`, but the master
# process needs to bind to port 80. We use the unprivileged port 8080
# instead so the container can run as a non-root user.
RUN addgroup -S app && adduser -S -G app app

# Replace the default nginx.conf with our hardened config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy the static export
COPY --from=build /app/out /usr/share/nginx/html

# Make pid + cache + run dirs writable by the unprivileged user
RUN chown -R app:app /usr/share/nginx/html \
 && chown -R app:app /var/cache/nginx \
 && chown -R app:app /var/log/nginx \
 && touch /var/run/nginx.pid \
 && chown app:app /var/run/nginx.pid

USER app
EXPOSE 8080

# Healthcheck — exit non-zero if the server stops responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
