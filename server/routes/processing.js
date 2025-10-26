/**
 * Processing routes
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const PYTHON_SERVICES_URL = process.env.PYTHON_SERVICES_URL || 'http://localhost:8000';

/**
 * @route   GET /api/processing/status
 * @desc    Get current processing status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const ProcessingStatus = require('../models/ProcessingStatus')(sequelize);

    // Try to get status from Python services first
    try {
      const response = await axios.get(`${PYTHON_SERVICES_URL}/processing-status`);
      
      // Update local database with latest status
      await ProcessingStatus.upsert({
        id: 1,
        ...response.data,
        last_updated: new Date()
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (pythonError) {
      logger.warn('Python services not available, using database status:', pythonError.message);
      
      // Fallback to database status
      const status = await ProcessingStatus.findOne({
        order: [['last_updated', 'DESC']]
      });

      if (!status) {
        return res.json({
          success: true,
          data: {
            status: 'idle',
            progress: 0,
            message: 'Ready to process data',
            last_updated: new Date()
          }
        });
      }

      res.json({
        success: true,
        data: status
      });
    }

  } catch (error) {
    logger.error('Error fetching processing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processing status',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/processing/trigger
 * @desc    Trigger data processing
 * @access  Public
 */
router.post('/trigger', async (req, res) => {
  try {
    const ProcessingStatus = require('../models/ProcessingStatus')(sequelize);

    // Check current status
    const currentStatus = await ProcessingStatus.findOne({
      order: [['last_updated', 'DESC']]
    });

    if (currentStatus && currentStatus.status === 'processing') {
      return res.status(409).json({
        success: false,
        error: 'Processing already in progress'
      });
    }

    // Try to trigger Python services
    try {
      const response = await axios.post(`${PYTHON_SERVICES_URL}/process-data`);
      
      res.json({
        success: true,
        data: response.data,
        message: 'Data processing triggered successfully'
      });

    } catch (pythonError) {
      logger.warn('Python services not available:', pythonError.message);
      
      // Update status to indicate Python services are unavailable
      await ProcessingStatus.upsert({
        id: 1,
        status: 'error',
        progress: 0,
        message: 'Python services unavailable',
        error_details: pythonError.message,
        last_updated: new Date()
      });

      res.status(503).json({
        success: false,
        error: 'Python services unavailable',
        message: 'Unable to trigger data processing. Please ensure Python services are running.'
      });
    }

  } catch (error) {
    logger.error('Error triggering processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger processing',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/processing/scores/recalculate
 * @desc    Trigger score recalculation
 * @access  Public
 */
router.post('/scores/recalculate', async (req, res) => {
  try {
    // Try to trigger Python services
    try {
      const response = await axios.post(`${PYTHON_SERVICES_URL}/calculate-scores`);
      
      res.json({
        success: true,
        data: response.data,
        message: 'Score recalculation triggered successfully'
      });

    } catch (pythonError) {
      logger.warn('Python services not available:', pythonError.message);
      
      res.status(503).json({
        success: false,
        error: 'Python services unavailable',
        message: 'Unable to trigger score recalculation. Please ensure Python services are running.'
      });
    }

  } catch (error) {
    logger.error('Error triggering score recalculation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger score recalculation',
      message: error.message
    });
  }
});

module.exports = router;
