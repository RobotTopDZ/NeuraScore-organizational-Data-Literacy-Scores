/**
 * PDF Generator utility for NeuraScore reports
 * Generates professional PDF reports from dashboard data
 */

const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.templates = {
      dashboard: this.generateDashboardHTML,
      team: this.generateTeamHTML,
      user: this.generateUserHTML,
      overview: this.generateDashboardHTML, // Alias for dashboard
      report: this.generateDashboardHTML    // Default report type
    };
  }

  /**
   * Generate PDF report (HTML version for now)
   */
  async generateReport(type, data, options = {}) {
    try {
      const template = this.templates[type];
      if (!template) {
        throw new Error(`Unknown report type: ${type}`);
      }

      const html = template.call(this, data, options);
      
      // For now, return HTML content
      // In production, you would use puppeteer or similar to generate actual PDF
      return {
        success: true,
        format: 'html',
        content: html,
        filename: `neurascore-${type}-report-${Date.now()}.html`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Dashboard Report HTML
   */
  generateDashboardHTML(data, options) {
    const { organization, teams, user_scores, insights, activity_timeline } = data;
    
    // Calculate additional metrics for the report
    const topPerformers = user_scores.slice(0, 10);
    const performanceDistribution = this.calculatePerformanceDistribution(user_scores);
    const teamPerformanceAnalysis = this.analyzeTeamPerformance(teams);
    const keyInsights = insights.slice(0, 6);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeuraScore Dashboard Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .section-header h2 {
            margin: 0;
            color: #495057;
        }
        .section-content {
            padding: 20px;
        }
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .team-card {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
        }
        .team-name {
            font-weight: bold;
            color: #495057;
            margin-bottom: 10px;
        }
        .score-bar {
            background: #e9ecef;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .score-fill {
            background: linear-gradient(90deg, #667eea, #764ba2);
            height: 100%;
            transition: width 0.3s ease;
        }
        .insights-list {
            list-style: none;
            padding: 0;
        }
        .insight-item {
            background: #f8f9fa;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .insight-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .insight-description {
            color: #6c757d;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            margin-top: 30px;
        }
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #dee2e6; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NeuraScore Analytics Report</h1>
        <p>Comprehensive Data Literacy Assessment</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">${organization.total_users}</div>
            <div class="metric-label">Total Users</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${organization.total_teams}</div>
            <div class="metric-label">Active Teams</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${organization.avg_neurascore.toFixed(1)}</div>
            <div class="metric-label">Average Score</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${organization.data_maturity_level}</div>
            <div class="metric-label">Maturity Level</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>Team Performance Overview</h2>
        </div>
        <div class="section-content">
            <div class="team-grid">
                ${teams.slice(0, 6).map(team => `
                    <div class="team-card">
                        <div class="team-name">${team.team_name}</div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Overall Score</span>
                            <span><strong>${team.avg_score.toFixed(1)}</strong></span>
                        </div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(team.avg_score / 100) * 100}%"></div>
                        </div>
                        <div style="font-size: 0.9em; color: #6c757d;">
                            ${team.member_count} members
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>Top Performers</h2>
        </div>
        <div class="section-content">
            <div style="display: grid; gap: 10px;">
                ${user_scores.slice(0, 10).map((user, index) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        <div style="display: flex; align-items: center;">
                            <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">
                                ${index + 1}
                            </div>
                            <span style="font-weight: 500;">${user.user_id}</span>
                        </div>
                        <span style="font-weight: bold; color: #667eea;">${user.overall_score.toFixed(1)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>Performance Distribution Analysis</h2>
        </div>
        <div class="section-content">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #28a745;">${performanceDistribution.excellent}</div>
                    <div style="color: #666;">Excellent (80+)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #17a2b8;">${performanceDistribution.good}</div>
                    <div style="color: #666;">Good (60-79)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #ffc107;">${performanceDistribution.average}</div>
                    <div style="color: #666;">Average (40-59)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #dc3545;">${performanceDistribution.needsImprovement}</div>
                    <div style="color: #666;">Needs Improvement (<40)</div>
                </div>
            </div>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">Performance Analysis Summary</h4>
                <p style="margin: 0; color: #424242;">
                    ${this.generatePerformanceAnalysisText(performanceDistribution, organization)}
                </p>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>Team Performance Insights</h2>
        </div>
        <div class="section-content">
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #f57c00;">Key Team Findings</h4>
                <ul style="margin: 0; padding-left: 20px; color: #424242;">
                    <li>Highest performing team: <strong>${teamPerformanceAnalysis.topTeam.team_name}</strong> (${teamPerformanceAnalysis.topTeam.avg_score.toFixed(1)} average score)</li>
                    <li>Most collaborative team: <strong>${teamPerformanceAnalysis.mostCollaborative.team_name}</strong> (${teamPerformanceAnalysis.mostCollaborative.collaboration_score.toFixed(1)} collaboration score)</li>
                    <li>Team with best documentation: <strong>${teamPerformanceAnalysis.bestDocumentation.team_name}</strong> (${teamPerformanceAnalysis.bestDocumentation.documentation_score.toFixed(1)} documentation score)</li>
                    <li>Average team size: <strong>${teamPerformanceAnalysis.avgTeamSize}</strong> members</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>Strategic Insights & Recommendations</h2>
        </div>
        <div class="section-content">
            <ul class="insights-list">
                ${keyInsights.map(insight => `
                    <li class="insight-item">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-description">${insight.description}</div>
                        <div style="margin-top: 8px;">
                            <span style="background: ${
                              insight.impact_level === 'high' ? '#dc3545' :
                              insight.impact_level === 'medium' ? '#ffc107' : '#28a745'
                            }; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                                ${insight.impact_level.toUpperCase()} IMPACT
                            </span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>This report was generated by NeuraScore Analytics Platform</p>
        <p>For more detailed analysis, visit your dashboard at localhost:3001</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Team Report HTML
   */
  generateTeamHTML(data, options) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Team Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metric { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Team Performance Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="metric">
        <h3>Team Overview</h3>
        <p>Detailed team analysis and performance metrics...</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate User Report HTML
   */
  generateUserHTML(data, options) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>User Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metric { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>User Performance Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="metric">
        <h3>User Analysis</h3>
        <p>Individual user performance and recommendations...</p>
    </div>
</body>
</html>`;
  }

  /**
   * Calculate performance distribution
   */
  calculatePerformanceDistribution(userScores) {
    return {
      excellent: userScores.filter(u => u.overall_score >= 80).length,
      good: userScores.filter(u => u.overall_score >= 60 && u.overall_score < 80).length,
      average: userScores.filter(u => u.overall_score >= 40 && u.overall_score < 60).length,
      needsImprovement: userScores.filter(u => u.overall_score < 40).length
    };
  }

  /**
   * Analyze team performance
   */
  analyzeTeamPerformance(teams) {
    const topTeam = teams.reduce((prev, current) => 
      (prev.avg_score > current.avg_score) ? prev : current
    );
    
    const mostCollaborative = teams.reduce((prev, current) => 
      (prev.collaboration_score > current.collaboration_score) ? prev : current
    );
    
    const bestDocumentation = teams.reduce((prev, current) => 
      (prev.documentation_score > current.documentation_score) ? prev : current
    );
    
    const avgTeamSize = Math.round(
      teams.reduce((sum, team) => sum + team.member_count, 0) / teams.length
    );

    return {
      topTeam,
      mostCollaborative,
      bestDocumentation,
      avgTeamSize
    };
  }

  /**
   * Generate performance analysis text
   */
  generatePerformanceAnalysisText(distribution, organization) {
    const total = distribution.excellent + distribution.good + distribution.average + distribution.needsImprovement;
    const excellentPct = Math.round((distribution.excellent / total) * 100);
    const needsImprovementPct = Math.round((distribution.needsImprovement / total) * 100);
    
    let analysis = `Your organization shows a ${organization.data_maturity_level.toLowerCase()} level of data literacy maturity with an average NeuraScore of ${organization.avg_neurascore}. `;
    
    if (excellentPct >= 20) {
      analysis += `With ${excellentPct}% of users performing at an excellent level, your organization demonstrates strong data capabilities. `;
    } else if (excellentPct >= 10) {
      analysis += `${excellentPct}% of users are performing at an excellent level, indicating good potential for growth. `;
    } else {
      analysis += `Only ${excellentPct}% of users are performing at an excellent level, suggesting significant opportunity for improvement. `;
    }
    
    if (needsImprovementPct > 20) {
      analysis += `However, ${needsImprovementPct}% of users need immediate attention and targeted training programs.`;
    } else if (needsImprovementPct > 10) {
      analysis += `${needsImprovementPct}% of users would benefit from additional support and training.`;
    } else {
      analysis += `Most users are performing well, with only ${needsImprovementPct}% requiring additional support.`;
    }
    
    return analysis;
  }
}

module.exports = new PDFGenerator();
