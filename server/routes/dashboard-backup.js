/**
 * Dashboard routes
 */

const express = require('express');
const { UserScore, TeamMetrics, Insight, ProcessingStatus } = require('../models');
const { Op } = require('sequelize');
const { generateSampleData } = require('../seeders/sampleData');
const router = express.Router();
const axios = require('axios');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Python services URL
const PYTHON_SERVICES_URL = process.env.PYTHON_SERVICES_URL || 'http://localhost:8000';

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard overview data
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching dashboard data');

    // Get models
    const UserScore = require('../models/UserScore')(sequelize);
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    const Insight = require('../models/Insight')(sequelize);

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
    const avgScore = await UserScore.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overall_score')), 'avg_score']
      ]
    });

    // Score distribution
    const { Op } = require('sequelize');
    const scoreRanges = await Promise.all([
      UserScore.count({ where: { overall_score: { [Op.gte]: 80 } } }),
      UserScore.count({ where: { overall_score: { [Op.between]: [60, 79] } } }),
      UserScore.count({ where: { overall_score: { [Op.between]: [40, 59] } } }),
      UserScore.count({ where: { overall_score: { [Op.lt]: 40 } } })
    ]);

    // Activity timeline (mock data for now)
    const activityTimeline = generateMockActivityTimeline();

    const dashboardData = {
      organization: {
        total_users: totalUsers,
        total_teams: teamMetrics.length,
        avg_neurascore: parseFloat(avgScore?.dataValues?.avg_score || 0).toFixed(1),
        data_literacy_distribution: {
          expert: scoreRanges[0],
          advanced: scoreRanges[1],
          intermediate: scoreRanges[2],
          beginner: scoreRanges[3]
        },
        top_performing_teams: teamMetrics.slice(0, 5),
        improvement_areas: extractImprovementAreas(insights)
      },
      teams: teamMetrics,
      user_scores: userScores,
      insights: insights,
      activity_timeline: activityTimeline
    };

    res.json({
      success: true,
      data: dashboardData
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
 * @route   POST /api/dashboard/refresh
 * @desc    Trigger dashboard data refresh
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Triggering dashboard data refresh');

    // Trigger Python services to recalculate scores
    try {
      const response = await axios.post(`${PYTHON_SERVICES_URL}/calculate-scores`);
      logger.info('Score calculation triggered:', response.data);
    } catch (pythonError) {
      logger.warn('Python services not available, using cached data:', pythonError.message);
    }

    res.json({
      success: true,
      message: 'Dashboard refresh triggered',
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

/**
 * Generate mock activity timeline data
 */
function generateMockActivityTimeline() {
  const timeline = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      interactions: Math.floor(Math.random() * 500) + 100,
      unique_users: Math.floor(Math.random() * 50) + 20
    });
  }
  
  return timeline;
}

/**
 * Extract improvement areas from insights
 */
function extractImprovementAreas(insights) {
  const areas = new Set();
  
  insights.forEach(insight => {
    if (insight.impact_level === 'high') {
      if (insight.title.includes('Discovery')) areas.add('Data Discovery');
      if (insight.title.includes('Collaboration')) areas.add('Team Collaboration');
      if (insight.title.includes('Documentation')) areas.add('Documentation Quality');
      if (insight.title.includes('Reuse')) areas.add('Data Reuse');
    }
  });
  
  return Array.from(areas);
}

module.exports = router;
