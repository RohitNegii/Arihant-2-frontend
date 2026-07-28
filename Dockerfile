# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install libc6-compat for packages that might need it
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy all code and configuration
COPY . .

# Accept NEXT_PUBLIC_API_URL as a build arg so Next.js can embed it in static assets at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set node environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy public assets and built pages from builder stage
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/next.config.ts ./

# Expose Next.js port
EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
