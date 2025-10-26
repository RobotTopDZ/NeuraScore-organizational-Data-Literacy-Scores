/**
 * Users routes
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { body, validationResult, query } = require('express-validator');

/**
 * @route   GET /api/users/scores
 * @desc    Get user scores with pagination
 * @access  Public
 */
router.get('/scores', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['overall_score', 'discovery_score', 'collaboration_score', 'documentation_score', 'reuse_score']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sort = req.query.sort || 'overall_score';
    const order = req.query.order || 'desc';
    const offset = (page - 1) * limit;

    const UserScore = require('../models/UserScore')(sequelize);

    // Get total count
    const totalCount = await UserScore.count();

    // Get paginated results
    const scores = await UserScore.findAll({
      order: [[sort, order.toUpperCase()]],
      limit,
      offset
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        scores,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user scores',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/users/:userId/score
 * @desc    Get specific user's score
 * @access  Public
 */
router.get('/:userId/score', async (req, res) => {
  try {
    const { userId } = req.params;

    const UserScore = require('../models/UserScore')(sequelize);

    const userScore = await UserScore.findOne({
      where: { user_id: userId }
    });

    if (!userScore) {
      return res.status(404).json({
        success: false,
        error: 'User score not found'
      });
    }

    res.json({
      success: true,
      data: userScore
    });

  } catch (error) {
    logger.error('Error fetching user score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user score',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get user leaderboard
 * @access  Public
 */
router.get('/leaderboard', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const limit = parseInt(req.query.limit) || 20;

    const UserScore = require('../models/UserScore')(sequelize);

    const leaderboard = await UserScore.findAll({
      order: [['overall_score', 'DESC']],
      limit
    });

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toJSON(),
      rank: index + 1
    }));

    res.json({
      success: true,
      data: rankedLeaderboard
    });

  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/users/statistics
 * @desc    Get user statistics
 * @access  Public
 */
router.get('/statistics', async (req, res) => {
  try {
    const UserScore = require('../models/UserScore')(sequelize);

    // Get basic statistics
    const stats = await UserScore.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
        [sequelize.fn('AVG', sequelize.col('overall_score')), 'avg_overall_score'],
        [sequelize.fn('AVG', sequelize.col('discovery_score')), 'avg_discovery_score'],
        [sequelize.fn('AVG', sequelize.col('collaboration_score')), 'avg_collaboration_score'],
        [sequelize.fn('AVG', sequelize.col('documentation_score')), 'avg_documentation_score'],
        [sequelize.fn('AVG', sequelize.col('reuse_score')), 'avg_reuse_score'],
        [sequelize.fn('MIN', sequelize.col('overall_score')), 'min_score'],
        [sequelize.fn('MAX', sequelize.col('overall_score')), 'max_score']
      ]
    });

    // Get score distribution
    const { Op } = require('sequelize');
    const distribution = await Promise.all([
      UserScore.count({ where: { overall_score: { [Op.gte]: 80 } } }),
      UserScore.count({ where: { overall_score: { [Op.between]: [60, 79] } } }),
      UserScore.count({ where: { overall_score: { [Op.between]: [40, 59] } } }),
      UserScore.count({ where: { overall_score: { [Op.lt]: 40 } } })
    ]);

    const statistics = {
      ...stats.toJSON(),
      score_distribution: {
        expert: distribution[0],
        advanced: distribution[1],
        intermediate: distribution[2],
        beginner: distribution[3]
      }
    };

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    logger.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
});

module.exports = router;
