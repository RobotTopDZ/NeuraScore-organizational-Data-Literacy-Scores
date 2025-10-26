/**
 * Health check routes
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Basic health check without database dependency
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'running'
      }
    };

    // Try database connection but don't fail if it's not available
    try {
      await sequelize.authenticate();
      healthData.services.database = 'connected';
    } catch (dbError) {
      healthData.services.database = 'disconnected';
      logger.warn('Database not available for health check:', dbError.message);
    }

    res.json({
      success: true,
      data: healthData
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Health check error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'error'
      }
    });
  }
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const os = require('os');
    
    // Check database connection
    await sequelize.authenticate();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg()
      },
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        versions: process.versions
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'running'
      }
    };

    res.json({
      success: true,
      data: healthData
    });

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
