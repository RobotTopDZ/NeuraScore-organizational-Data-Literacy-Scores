/**
 * NeuraScore Express.js Server
 * Main entry point for the backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const { initializeDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const teamsRoutes = require('./routes/teams');
const insightsRoutes = require('./routes/insights');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const processingRoutes = require('./routes/processing');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration - more permissive for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.RAILWAY_PUBLIC_DOMAIN].filter(Boolean)
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) }
}));

// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../frontend/.next');
const frontendPublicPath = path.join(__dirname, '../frontend/public');

// Serve Next.js static files
app.use('/_next', express.static(path.join(frontendPath, 'static')));
app.use('/public', express.static(frontendPublicPath));

// Serve Next.js standalone server if available
let nextHandler;
try {
  const nextServer = require(path.join(frontendPath, 'standalone/server.js'));
  nextHandler = nextServer;
} catch (err) {
  console.log('Next.js standalone server not available, using fallback');
}

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/health', healthRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'NeuraScore API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      dashboard: '/api/dashboard',
      users: '/api/users',
      teams: '/api/teams',
      insights: '/api/insights',
      analytics: '/api/analytics',
      reports: '/api/reports',
      processing: '/api/processing',
      health: '/api/health'
    }
  });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  // If it's an API request that doesn't exist, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl
    });
  }
  
  // Try to use Next.js standalone server first
  if (nextHandler) {
    return nextHandler(req, res);
  }
  
  // Try to serve static HTML files
  const staticPaths = [
    path.join(__dirname, '../frontend/.next/server/app/page.html'),
    path.join(__dirname, '../frontend/.next/server/pages/index.html'),
    path.join(__dirname, '../frontend/out/index.html')
  ];
  
  let served = false;
  for (const staticPath of staticPaths) {
    if (!served) {
      res.sendFile(staticPath, (err) => {
        if (!err) {
          served = true;
        } else if (staticPath === staticPaths[staticPaths.length - 1]) {
          // Last attempt failed, show fallback
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>euraScore Analytics Platform</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                       margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                            max-width: 600px; text-align: center; }
                .logo { font-size: 2.5em; color: #2563eb; margin-bottom: 20px; font-weight: bold; }
                .message { font-size: 1.2em; margin-bottom: 30px; color: #374151; }
                .links { margin: 30px 0; }
                .links a { display: inline-block; margin: 10px; padding: 12px 24px; 
                          background: #2563eb; color: white; text-decoration: none; 
                          border-radius: 8px; transition: all 0.3s; font-weight: 500; }
                .links a:hover { background: #1d4ed8; transform: translateY(-2px); }
                .status { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px; }
                .status-good { color: #059669; font-weight: 500; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">euraScore</div>
                <div class="message">Analytics Platform</div>
                <div class="status">
                  <div class="status-good">✅ Backend API: Running</div>
                  <div style="color: #d97706; margin-top: 8px;">⚠️ Frontend: Building...</div>
                </div>
                <div class="links">
                  <a href="/api">API Documentation</a>
                  <a href="/api/dashboard">Dashboard Data</a>
                  <a href="/api/health">System Health</a>
                </div>
                <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
                  The frontend is currently being built and deployed. This page will automatically 
                  show the full dashboard once the build completes.
                </p>
              </div>
            </body>
            </html>
          `);
        }
      });
      if (!served) break;
    }
  }
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Try to initialize database, but don't fail if it's not available
    try {
      await initializeDatabase();
      logger.info('Database initialized successfully');
    } catch (dbError) {
      logger.warn('Database initialization failed, starting server without database:', dbError.message);
    }

    // Start server regardless of database status
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`NeuraScore server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
