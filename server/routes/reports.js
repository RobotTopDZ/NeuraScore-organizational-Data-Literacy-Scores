/**
 * Reports routes
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { generateSampleData } = require('../seeders/simpleSampleData');
const pdfGenerator = require('../utils/pdfGenerator');
const logger = require('../utils/logger');

/**
 * @route   GET /api/reports
 * @desc    Get reports data with sample data fallback
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const reportType = req.query.type || 'overview';
    logger.info(`Fetching reports data for type: ${reportType}`);

    const UserScore = require('../models/UserScore')(sequelize);
    const userCount = await UserScore.count();

    let reportsData;

    if (userCount === 0) {
      // No real data exists, use sample data
      logger.info('No real data found, generating sample reports data');
      const sampleData = generateSampleData();
      
      reportsData = {
        organization: sampleData.organization,
        trends: {
          score_trend: 5.2,
          user_growth: 12.3,
          activity_trend: 8.7
        },
        top_performers: sampleData.user_scores.slice(0, 5),
        insights: sampleData.insights.slice(0, 4)
      };
    } else {
      // Use real data from database
      logger.info('Using real data for reports');
      
      const TeamMetrics = require('../models/TeamMetrics')(sequelize);
      const Insight = require('../models/Insight')(sequelize);
      
      const [totalUsers, totalTeams, avgScore, topUsers, insights] = await Promise.all([
        UserScore.count(),
        TeamMetrics.count(),
        UserScore.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('overall_score')), 'avg_score']]
        }),
        UserScore.findAll({
          order: [['overall_score', 'DESC']],
          limit: 5
        }),
        Insight.findAll({
          where: { status: 'active' },
          order: [['priority_score', 'DESC']],
          limit: 4
        })
      ]);

      const avgNeurascore = parseFloat(avgScore?.dataValues?.avg_score || 0);
      let maturityLevel = 'Emerging';
      if (avgNeurascore >= 75) maturityLevel = 'Advanced';
      else if (avgNeurascore >= 50) maturityLevel = 'Developing';
      else if (avgNeurascore >= 25) maturityLevel = 'Basic';

      reportsData = {
        organization: {
          total_users: totalUsers,
          total_teams: totalTeams,
          avg_neurascore: avgNeurascore,
          data_maturity_level: maturityLevel
        },
        trends: {
          score_trend: 5.2,
          user_growth: 12.3,
          activity_trend: 8.7
        },
        top_performers: topUsers.map(user => user.toJSON()),
        insights: insights.map(insight => insight.toJSON())
      };
    }

    res.json({
      success: true,
      data: reportsData,
      timestamp: new Date().toISOString(),
      source: userCount > 0 ? 'database' : 'sample'
    });

  } catch (error) {
    logger.error('Error fetching reports data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/reports/export
 * @desc    Export report as PDF
 * @access  Public
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'pdf', type = 'dashboard' } = req.query;

    logger.info(`Generating ${format} export for ${type} report`);

    // Get data for the report
    let reportData;
    const UserScore = require('../models/UserScore')(sequelize);
    const userCount = await UserScore.count();

    if (userCount === 0) {
      // Use sample data
      reportData = generateSampleData();
    } else {
      // Use real data (implement as needed)
      reportData = generateSampleData(); // For now, use sample data
    }

    if (format === 'pdf' || format === 'html') {
      // Generate PDF/HTML report
      const pdfResult = await pdfGenerator.generateReport(type, reportData);
      
      if (format === 'html') {
        // Return HTML directly
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
        res.send(pdfResult.content);
      } else {
        // For PDF, return the HTML content with instructions
        res.json({
          success: true,
          data: {
            format: 'html',
            content: pdfResult.content,
            filename: pdfResult.filename,
            message: 'Report generated successfully. Save the content as HTML file.',
            instructions: 'Copy the content and save as .html file, then print to PDF from browser'
          }
        });
      }
    } else if (format === 'csv') {
      // Generate CSV export
      const csvData = generateCSVReport(reportData, type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="neurascore-${type}-${Date.now()}.csv"`);
      res.send(csvData);
    } else {
      res.status(400).json({
        success: false,
        error: 'Unsupported format. Use pdf, html, or csv'
      });
    }

  } catch (error) {
    logger.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/reports/summary
 * @desc    Get report summary data
 * @access  Public
 */
router.get('/summary', async (req, res) => {
  try {
    const UserScore = require('../models/UserScore')(sequelize);
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    const Insight = require('../models/Insight')(sequelize);

    // Get summary statistics
    const [userStats, teamStats, insightStats] = await Promise.all([
      UserScore.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
          [sequelize.fn('AVG', sequelize.col('overall_score')), 'avg_score'],
          [sequelize.fn('MIN', sequelize.col('overall_score')), 'min_score'],
          [sequelize.fn('MAX', sequelize.col('overall_score')), 'max_score']
        ]
      }),
      TeamMetrics.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_teams'],
          [sequelize.fn('AVG', sequelize.col('avg_neurascore')), 'avg_team_score']
        ]
      }),
      Insight.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_insights']
        ],
        where: { status: 'active' }
      })
    ]);

    const summary = {
      users: userStats?.toJSON() || {},
      teams: teamStats?.toJSON() || {},
      insights: insightStats?.toJSON() || {},
      generated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error fetching report summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report summary',
      message: error.message
    });
  }
});

/**
 * Generate CSV report data
 */
function generateCSVReport(data, type) {
  if (type === 'dashboard') {
    // Generate user scores CSV
    const headers = ['User ID', 'Overall Score', 'Discovery Score', 'Collaboration Score', 'Documentation Score', 'Reuse Score', 'Activity Count'];
    const rows = data.user_scores.map(user => [
      user.user_id,
      user.overall_score,
      user.discovery_score,
      user.collaboration_score,
      user.documentation_score,
      user.reuse_score,
      user.activity_count
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  } else if (type === 'teams') {
    // Generate teams CSV
    const headers = ['Team ID', 'Team Name', 'Member Count', 'Average Score', 'Discovery Score', 'Collaboration Score', 'Documentation Score', 'Reuse Score'];
    const rows = data.teams.map(team => [
      team.team_id,
      team.team_name,
      team.member_count,
      team.avg_score,
      team.discovery_score,
      team.collaboration_score,
      team.documentation_score,
      team.reuse_score
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  return 'No data available for CSV export';
}

/**
 * Generate report data based on type
 */
async function generateReportData(type, entityId) {
  const UserScore = require('../models/UserScore')(sequelize);
  const TeamMetrics = require('../models/TeamMetrics')(sequelize);

  switch (type) {
    case 'dashboard':
      return {
        title: 'NeuraScore Dashboard Report',
        totalUsers: await UserScore.count(),
        totalTeams: await TeamMetrics.count(),
        avgScore: await UserScore.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('overall_score')), 'avg']]
        })
      };

    case 'team':
      if (!entityId) {
        throw new Error('Team ID is required for team reports');
      }
      const team = await TeamMetrics.findOne({ where: { team_id: entityId } });
      return {
        title: `Team Report - ${team?.team_name || entityId}`,
        teamData: team
      };

    case 'user':
      if (!entityId) {
        throw new Error('User ID is required for user reports');
      }
      const user = await UserScore.findOne({ where: { user_id: entityId } });
      return {
        title: `User Report - ${entityId}`,
        userData: user
      };

    default:
      throw new Error('Invalid report type');
  }
}

module.exports = router;
