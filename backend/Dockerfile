# =========================================================================
# Stage 1: Build Stage
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci

# Copy TypeScript source and config
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client and compile TypeScript
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/career_assistant"
RUN npm run build

# Prune devDependencies for clean production build
RUN npm prune --omit=dev

# =========================================================================
# Stage 2: Production Runtime
# =========================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create non-root user
USER node

# Copy dependencies and compiled artifacts from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["node", "dist/server.js"]
