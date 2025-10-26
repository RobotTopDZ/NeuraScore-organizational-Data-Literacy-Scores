# NeuraScore Deployment Guide

## Overview

This guide covers deploying NeuraScore in various environments, from development to production. The platform consists of three main components that need to be deployed and configured properly.

## Architecture Components

1. **Frontend Application** (Next.js) - Port 3001
2. **Backend API Server** (Express.js) - Port 3000  
3. **ML Services** (FastAPI/Python) - Port 8001

## Development Deployment

### Prerequisites

- Node.js 18.0 or higher
- Python 3.9 or higher
- Git for version control
- 4GB RAM minimum (8GB recommended)

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-org/neurascore.git
   cd neurascore
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../server
   npm install

   # Python Services
   cd ../python-services
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   # Backend environment
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend  
   cd frontend
   npm run dev

   # Terminal 3: ML Services
   cd python-services
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

5. **Verify Installation**
   ```bash
   # Test all services
   node test-advanced-features.js
   ```

## Production Deployment

### Environment Setup

#### Backend Environment (.env.production)
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/neurascore
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=neurascore_prod
DB_USER=neurascore_user
DB_PASS=secure_production_password

# Application Settings
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Security Settings
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External Services
PYTHON_SERVICES_URL=http://localhost:8001
LOG_LEVEL=info
```

#### Frontend Environment (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_ML_API_URL=https://ml.your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Database Setup

#### PostgreSQL Configuration
```sql
-- Create database and user
CREATE DATABASE neurascore_prod;
CREATE USER neurascore_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE neurascore_prod TO neurascore_user;

-- Connect to the database
\c neurascore_prod;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO neurascore_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neurascore_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neurascore_user;
```

#### Database Migration
```bash
cd server
NODE_ENV=production npm run db:migrate
NODE_ENV=production npm run db:seed  # Optional: for sample data
```

### Application Build

#### Frontend Build
```bash
cd frontend
npm run build
npm run export  # For static deployment
```

#### Backend Preparation
```bash
cd server
npm install --production
npm run build  # If you have a build step
```

#### Python Services Setup
```bash
cd python-services
pip install --no-dev -r requirements.txt
```

### Deployment Options

## Option 1: Traditional Server Deployment

### Using PM2 (Recommended)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [
       {
         name: 'neurascore-backend',
         script: 'server/index.js',
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         },
         instances: 2,
         exec_mode: 'cluster',
         max_memory_restart: '1G',
         error_file: './logs/backend-error.log',
         out_file: './logs/backend-out.log',
         log_file: './logs/backend-combined.log'
       },
       {
         name: 'neurascore-ml',
         script: 'python-services/start.py',
         interpreter: 'python3',
         env: {
           PORT: 8001,
           PYTHONPATH: './python-services'
         },
         instances: 1,
         max_memory_restart: '2G',
         error_file: './logs/ml-error.log',
         out_file: './logs/ml-out.log'
       }
     ]
   };
   ```

3. **Start Services**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/neurascore
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/neurascore/frontend/out;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # ML Services
       location /analytics/ {
           proxy_pass http://localhost:8001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/neurascore /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Option 2: Docker Deployment

### Docker Configuration

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

USER node
CMD ["npm", "start"]
```

#### Python Services Dockerfile
```dockerfile
# python-services/Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
      - NEXT_PUBLIC_ML_API_URL=http://ml-services:8001

  backend:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - database
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://neurascore:password@database:5432/neurascore
      - PYTHON_SERVICES_URL=http://ml-services:8001
    volumes:
      - ./logs:/app/logs

  ml-services:
    build: ./python-services
    ports:
      - "8001:8001"
    environment:
      - PYTHONPATH=/app
    volumes:
      - ./logs:/app/logs

  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=neurascore
      - POSTGRES_USER=neurascore
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

## Option 3: Cloud Platform Deployment

### Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_ML_API_URL production
   ```

### Railway (Backend & ML Services)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy Backend**
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. **Deploy ML Services**
   ```bash
   cd python-services
   railway init
   railway up
   ```

### AWS EC2 Deployment

#### EC2 Instance Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip python3-venv -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-org/neurascore.git
cd neurascore
```

#### Security Configuration
```bash
# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# SSL Certificate with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Maintenance

### Health Checks

#### Backend Health Check
```javascript
// server/routes/health.js
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

#### ML Services Health Check
```python
# python-services/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }
```

### Monitoring Setup

#### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all
```

#### Log Rotation
```bash
# Install logrotate configuration
sudo tee /etc/logrotate.d/neurascore << EOF
/path/to/neurascore/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### Backup Strategy

#### Database Backup
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/neurascore"
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U neurascore_user neurascore_prod > $BACKUP_DIR/neurascore_$DATE.sql
gzip $BACKUP_DIR/neurascore_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

#### Application Backup
```bash
#!/bin/bash
# backup-app.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/neurascore-app"
APP_DIR="/path/to/neurascore"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/neurascore-app_$DATE.tar.gz -C $APP_DIR .

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_user_scores_overall ON user_scores(overall_score DESC);
CREATE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_team_metrics_team_id ON team_metrics(team_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_priority ON insights(priority_score DESC);

-- Analyze tables
ANALYZE user_scores;
ANALYZE team_metrics;
ANALYZE insights;
```

#### Application Optimization
```javascript
// Enable compression
app.use(compression());

// Set up caching
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8001
   
   # Kill processes if needed
   sudo kill -9 $(lsof -t -i:3000)
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql -h localhost -U neurascore_user -d neurascore_prod
   
   # Check database status
   sudo systemctl status postgresql
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   top -p $(pgrep -f "node\|python")
   
   # Restart services if needed
   pm2 restart all
   ```

4. **SSL Certificate Issues**
   ```bash
   # Renew certificates
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

### Performance Monitoring

#### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor system resources
htop
iotop -o
nethogs
```

#### Application Monitoring
```javascript
// Add to your Express app
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Database credentials secured
- [ ] HTTPS enabled with valid certificates
- [ ] Firewall configured correctly
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] CORS properly configured

## Support

For deployment support:
- Review this guide thoroughly
- Check the main README.md for additional information
- Create an issue in the GitHub repository with deployment details
- Include system information, error logs, and configuration details
