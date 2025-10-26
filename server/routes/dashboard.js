/**
 * Dashboard routes with sample data fallback
 */

const express = require('express');
const { Op } = require('sequelize');
const { generateSampleData } = require('../seeders/simpleSampleData');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard overview data with sample data fallback
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching dashboard data');

    // Get models
    const UserScore = require('../models/UserScore')(sequelize);
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    const Insight = require('../models/Insight')(sequelize);

    // Check if we have real data
    const userCount = await UserScore.count();
    const teamCount = await TeamMetrics.count();
    const insightCount = await Insight.count();

    let dashboardData;

    if (userCount === 0 && teamCount === 0 && insightCount === 0) {
      // No real data exists, use sample data
      logger.info('No real data found, generating sample data');
      dashboardData = generateSampleData();
    } else {
      // Use real data from database
      logger.info('Using real data from database');
      
      // Fetch data from database
      const [userScores, teamMetrics, insights] = await Promise.all([
        UserScore.findAll({
          order: [['overall_score', 'DESC']],
          limit: 20
        }),
        TeamMetrics.findAll({
          order: [['avg_neurascore', 'DESC']]
        }),
        Insight.findAll({
          where: { status: 'active' },
          order: [['priority_score', 'DESC']],
          limit: 10
        })
      ]);

      // Calculate organization metrics
      const totalUsers = await UserScore.count();
      const totalTeams = await TeamMetrics.count();
      const avgScore = await UserScore.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('overall_score')), 'avg_score']
        ]
      });

      // Determine maturity level
      const avgNeurascore = parseFloat(avgScore?.dataValues?.avg_score || 0);
      let maturityLevel = 'Emerging';
      if (avgNeurascore >= 75) maturityLevel = 'Advanced';
      else if (avgNeurascore >= 50) maturityLevel = 'Developing';
      else if (avgNeurascore >= 25) maturityLevel = 'Basic';

      // Generate activity timeline (mock for now)
      const activityTimeline = generateMockActivityTimeline();

      dashboardData = {
        organization: {
          total_users: totalUsers,
          total_teams: totalTeams,
          avg_neurascore: avgNeurascore,
          data_maturity_level: maturityLevel
        },
        teams: teamMetrics.map(team => team.toJSON()),
        user_scores: userScores.map(user => user.toJSON()),
        insights: insights.map(insight => insight.toJSON()),
        activity_timeline: activityTimeline
      };
    }

    logger.info(`Dashboard data prepared: ${dashboardData.user_scores.length} users, ${dashboardData.teams.length} teams`);

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      source: userCount > 0 ? 'database' : 'sample'
    });

  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

/**
 * Generate mock activity timeline
 */
function generateMockActivityTimeline() {
  const activities = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    activities.push({
      id: `activity_${i}`,
      description: `Data processing activity ${i + 1}`,
      timestamp: timestamp.toISOString(),
      user_id: `user_${i % 10}`,
      activity_type: 'processing'
    });
  }
  
  return activities;
}

/**
 * @route   GET /api/dashboard/refresh
 * @desc    Force refresh dashboard data
 * @access  Public
 */
router.get('/refresh', async (req, res) => {
  try {
    logger.info('Forcing dashboard data refresh');
    
    // This could trigger data reprocessing in the future
    res.json({
      success: true,
      message: 'Dashboard refresh initiated',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error refreshing dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh dashboard',
      message: error.message
    });
  }
});

module.exports = router;
