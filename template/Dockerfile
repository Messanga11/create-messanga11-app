# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS build
WORKDIR /workspace
COPY . .
RUN npm ci --ignore-scripts && npm run build:web && npm run build -w @starter/worker

FROM node:24-bookworm-slim AS web
ENV NODE_ENV=production
WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build --chown=app:app /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /workspace/apps/web/.next/static ./apps/web/.next/static
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

FROM node:24-bookworm-slim AS worker
ENV NODE_ENV=production
WORKDIR /app
RUN useradd --system --uid 10001 worker
COPY --from=build --chown=worker:worker /workspace/apps/worker/dist ./dist
COPY --from=build --chown=worker:worker /workspace/node_modules ./node_modules
USER worker
CMD ["node", "dist/index.js"]
