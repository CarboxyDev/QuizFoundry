# ---- Build Stage ----
FROM node:20-slim AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy workspace files (lockfile + tsconfigs)
COPY pnpm-workspace.yaml ./
COPY backend/pnpm-lock.yaml backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install deps for whole monorepo (including shared)
COPY shared ./shared
COPY backend ./backend
RUN pnpm install --frozen-lockfile --filter backend...

# Compile TypeScript using project references
WORKDIR /app/backend
RUN pnpm exec tsc -b

# ---- Run Stage ----
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy built code
COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Cloud Run expects app to listen on $PORT
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
