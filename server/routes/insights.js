/**
 * Insights routes
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { query, validationResult } = require('express-validator');

/**
 * @route   GET /api/insights
 * @desc    Get insights and recommendations
 * @access  Public
 */
router.get('/', [
  query('entityType').optional().isIn(['user', 'team', 'organization']).withMessage('Invalid entity type'),
  query('entityId').optional().isString().withMessage('Entity ID must be a string'),
  query('impactLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid impact level'),
  query('status').optional().isIn(['active', 'acknowledged', 'resolved', 'dismissed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { entityType, entityId, impactLevel, status = 'active' } = req.query;
    const Insight = require('../models/Insight')(sequelize);

    // Build where clause
    const whereClause = { status };
    
    if (entityType) {
      whereClause.target_entity = entityType;
    }
    
    if (entityId) {
      whereClause.target_id = entityId;
    }
    
    if (impactLevel) {
      whereClause.impact_level = impactLevel;
    }

    const insights = await Insight.findAll({
      where: whereClause,
      order: [['priority_score', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/insights/:insightId/acknowledge
 * @desc    Acknowledge an insight
 * @access  Public
 */
router.put('/:insightId/acknowledge', async (req, res) => {
  try {
    const { insightId } = req.params;
    const Insight = require('../models/Insight')(sequelize);

    const insight = await Insight.findByPk(insightId);
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    await insight.update({
      status: 'acknowledged',
      acknowledged_at: new Date()
    });

    res.json({
      success: true,
      data: insight,
      message: 'Insight acknowledged successfully'
    });

  } catch (error) {
    logger.error('Error acknowledging insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge insight',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/insights/:insightId/resolve
 * @desc    Mark an insight as resolved
 * @access  Public
 */
router.put('/:insightId/resolve', async (req, res) => {
  try {
    const { insightId } = req.params;
    const Insight = require('../models/Insight')(sequelize);

    const insight = await Insight.findByPk(insightId);
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    await insight.update({
      status: 'resolved',
      resolved_at: new Date()
    });

    res.json({
      success: true,
      data: insight,
      message: 'Insight resolved successfully'
    });

  } catch (error) {
    logger.error('Error resolving insight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve insight',
      message: error.message
    });
  }
});

module.exports = router;
