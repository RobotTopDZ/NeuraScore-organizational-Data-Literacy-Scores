# Multi-stage build for NeuraScore platform
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Python services stage
FROM python:3.9-slim AS python-services

WORKDIR /app/python-services
COPY python-services/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY python-services/ ./

# Final production stage
FROM node:18-alpine AS production

# Install Python for ML services
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /app

# Copy backend
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/

# Copy Python services
COPY --from=python-services /app/python-services ./python-services

# Copy server code
COPY server/ ./server/

# Copy data files
COPY data/ ./data/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server/index.js"]
