/**
 * Users routes with sample data fallback
 */

const express = require('express');
const { UserScore } = require('../models');
const { generateSampleData } = require('../seeders/sampleData');
const router = express.Router();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/users/scores
 * @desc    Get user scores with pagination and sample data fallback
 * @access  Public
 */
router.get('/scores', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    logger.info(`Fetching user scores - page: ${page}, limit: ${limit}, search: "${search}"`);

    const UserScore = require('../models/UserScore')(sequelize);
    const userCount = await UserScore.count();

    let usersData, totalUsers;

    if (userCount === 0) {
      // No real data exists, use sample data
      logger.info('No real user data found, generating sample data');
      const sampleData = generateSampleData();
      let filteredUsers = sampleData.user_scores;

      // Apply search filter if provided
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.user_id.toLowerCase().includes(search.toLowerCase())
        );
      }

      totalUsers = filteredUsers.length;
      usersData = filteredUsers.slice(offset, offset + limit);
    } else {
      // Use real data from database
      logger.info('Using real user data from database');
      
      const whereClause = search ? {
        user_id: {
          [require('sequelize').Op.iLike]: `%${search}%`
        }
      } : {};

      const [users, total] = await Promise.all([
        UserScore.findAll({
          where: whereClause,
          order: [['overall_score', 'DESC']],
          limit: limit,
          offset: offset
        }),
        UserScore.count({ where: whereClause })
      ]);

      usersData = users.map(user => user.toJSON());
      totalUsers = total;
    }

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        scores: usersData,
        total: totalUsers,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString(),
      source: userCount > 0 ? 'database' : 'sample'
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
 * @route   GET /api/users/:id
 * @desc    Get specific user details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching user data for ID: ${id}`);

    const UserScore = require('../models/UserScore')(sequelize);
    let user = await UserScore.findOne({
      where: { user_id: id }
    });

    if (!user) {
      // If no real user found, generate sample user
      const sampleData = generateSampleData();
      user = sampleData.user_scores.find(u => u.user_id === id) || sampleData.user_scores[0];
    } else {
      user = user.toJSON();
    }

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/users/top/:limit
 * @desc    Get top performing users
 * @access  Public
 */
router.get('/top/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    logger.info(`Fetching top ${limit} users`);

    const UserScore = require('../models/UserScore')(sequelize);
    const userCount = await UserScore.count();

    let topUsers;

    if (userCount === 0) {
      // No real data exists, use sample data
      const sampleData = generateSampleData();
      topUsers = sampleData.user_scores.slice(0, limit);
    } else {
      // Use real data from database
      const users = await UserScore.findAll({
        order: [['overall_score', 'DESC']],
        limit: limit
      });
      topUsers = users.map(user => user.toJSON());
    }

    res.json({
      success: true,
      data: {
        users: topUsers,
        count: topUsers.length
      },
      timestamp: new Date().toISOString(),
      source: userCount > 0 ? 'database' : 'sample'
    });

  } catch (error) {
    logger.error('Error fetching top users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top users',
      message: error.message
    });
  }
});

module.exports = router;
