# ==========================================
# Production Multi-Stage Dockerfile: Backend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy full source and compile
COPY . .
RUN npx prisma generate
RUN npm run build

# ==========================================
# Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production
RUN npx prisma generate

# Copy compiled JavaScript output from builder
COPY --from=builder /app/dist ./dist

# Create uploads storage directory
RUN mkdir -p /app/uploads

EXPOSE 5000

# Deploy schema migrations and start Express server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
