# Simplified single-stage build for faster deployment
FROM node:20-alpine

# Install Python for ML services
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /app

# Copy and install backend dependencies first (better caching)
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy and install Python dependencies
COPY python-services/requirements.txt ./python-services/
RUN cd python-services && pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy and build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy remaining source code
COPY server/ ./server/
COPY python-services/ ./python-services/
COPY data/ ./data/

# Ensure frontend build artifacts are available
RUN ls -la ./frontend/.next/ || echo "Next.js build directory not found"
RUN mkdir -p ./frontend/public

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server/index.js"]
