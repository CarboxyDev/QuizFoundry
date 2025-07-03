# --- Builder stage ---
FROM node:20 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy backend only 
COPY backend/ ./

# Install deps and build
RUN pnpm install
RUN pnpm exec tsc

# --- Runtime stage ---
FROM node:20-slim

WORKDIR /app

# Copy built code and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install production dependencies
RUN npm install -g pnpm && pnpm install --prod

# Set env and start
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]