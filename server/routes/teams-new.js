/**
 * Teams routes with sample data fallback
 */

const express = require('express');
const { TeamMetrics } = require('../models');
const { generateSampleData } = require('../seeders/sampleData');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/teams
 * @desc    Get all teams with sample data fallback
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching teams data');

    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    const teamCount = await TeamMetrics.count();

    let teamsData;

    if (teamCount === 0) {
      // No real data exists, use sample data
      logger.info('No real team data found, generating sample data');
      const sampleData = generateSampleData();
      teamsData = sampleData.teams;
    } else {
      // Use real data from database
      logger.info('Using real team data from database');
      const teams = await TeamMetrics.findAll({
        order: [['avg_neurascore', 'DESC']]
      });
      teamsData = teams.map(team => team.toJSON());
    }

    res.json({
      success: true,
      data: {
        teams: teamsData,
        total: teamsData.length
      },
      timestamp: new Date().toISOString(),
      source: teamCount > 0 ? 'database' : 'sample'
    });

  } catch (error) {
    logger.error('Error fetching teams data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/teams/:id
 * @desc    Get specific team details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching team data for ID: ${id}`);

    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    let team = await TeamMetrics.findOne({
      where: { team_id: id }
    });

    if (!team) {
      // If no real team found, generate sample team
      const sampleData = generateSampleData();
      team = sampleData.teams.find(t => t.team_id === id) || sampleData.teams[0];
    } else {
      team = team.toJSON();
    }

    res.json({
      success: true,
      data: team,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching team data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team data',
      message: error.message
    });
  }
});

module.exports = router;
