/**
 * Teams routes
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/teams
 * @desc    Get all team metrics
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);

    const teams = await TeamMetrics.findAll({
      order: [['avg_neurascore', 'DESC']]
    });

    res.json({
      success: true,
      data: teams
    });

  } catch (error) {
    logger.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/teams/:teamId
 * @desc    Get specific team metrics
 * @access  Public
 */
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);

    const team = await TeamMetrics.findOne({
      where: { team_id: teamId }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: team
    });

  } catch (error) {
    logger.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team',
      message: error.message
    });
  }
});

module.exports = router;
