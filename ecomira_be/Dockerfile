FROM node:20-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Configure npm
RUN npm config set registry https://registry.npmmirror.com
RUN npm set fetch-retries 5 && \
    npm set fetch-retry-factor 2 && \
    npm set fetch-retry-mintimeout 20000

# Install dependencies
RUN npm ci --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start script
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]