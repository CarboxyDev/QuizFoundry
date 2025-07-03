# ---- Build Stage ----
FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy all monorepo root files into context
COPY . .

# Install all dependencies (backend + shared)
RUN pnpm install --frozen-lockfile --filter backend...

# Compile backend + shared TypeScript
WORKDIR /app/backend
RUN pnpm exec tsc -b

# ---- Run Stage ----
FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /app

# Copy built output from builder
COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
