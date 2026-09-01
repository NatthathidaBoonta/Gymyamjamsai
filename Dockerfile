# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source
COPY frontend/ ./

# Define VITE_API_URL so the frontend makes relative API calls
ENV VITE_API_URL=/api

# Build React app
RUN npm run build

# ==========================================
# Stage 2: Build Backend & Serve
# ==========================================
FROM node:20-alpine AS backend-runner

# Install dumb-init for proper signal handling in Node.js
RUN apk add --no-cache dumb-init

WORKDIR /app/backend

# Install dependencies (production only)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Create public directory and copy frontend build from Stage 1
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Set production environment
ENV NODE_ENV=production
# Fallback port (Railway provides PORT dynamically)
ENV PORT=5000 

EXPOSE 5000

# Security: Run as non-root user
RUN chown -R node:node /app
USER node

# Use dumb-init to wrap node process (handles SIGTERM properly)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
