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
  
  // For all other routes, serve the frontend
  const indexPath = path.join(__dirname, '../frontend/.next/server/pages/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Fallback to a simple HTML page if Next.js files aren't available
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>NeuraScore Analytics Platform</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .logo { font-size: 2em; color: #2563eb; margin-bottom: 20px; }
            .message { font-size: 1.2em; margin-bottom: 30px; }
            .links a { display: inline-block; margin: 10px; padding: 10px 20px; 
                      background: #2563eb; color: white; text-decoration: none; 
                      border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">euraScore Analytics Platform</div>
            <div class="message">Welcome to the NeuraScore Analytics Platform</div>
            <div class="links">
              <a href="/api">API Documentation</a>
              <a href="/api/dashboard">Dashboard Data</a>
              <a href="/api/health">Health Check</a>
            </div>
            <p>The frontend application is loading. If you continue to see this page, 
               the frontend build may not be available.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`NeuraScore server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://localhost:${PORT}/`);
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
