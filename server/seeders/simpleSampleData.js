/**
 * Simple sample data generator for NeuraScore platform
 * Generates realistic teams, users, and insights when no real data exists
 */

// Sample company departments and roles
const departments = [
  'Engineering', 'Data Science', 'Product Management', 'Marketing', 
  'Sales', 'Operations', 'Finance', 'Human Resources', 'Customer Success'
];

const roles = [
  'Data Analyst', 'Software Engineer', 'Product Manager', 'Marketing Analyst',
  'Sales Analyst', 'Operations Analyst', 'Financial Analyst', 'HR Analyst',
  'Business Intelligence Developer', 'Data Scientist', 'Research Analyst'
];

const userNames = [
  'alice.johnson', 'bob.smith', 'carol.davis', 'david.wilson', 'emma.brown',
  'frank.miller', 'grace.taylor', 'henry.clark', 'iris.martinez', 'jack.lee',
  'kate.anderson', 'liam.thomas', 'maya.garcia', 'noah.rodriguez', 'olivia.lopez',
  'paul.gonzalez', 'quinn.harris', 'ruby.young', 'sam.king', 'tina.wright',
  'uma.hill', 'victor.green', 'wendy.adams', 'xavier.baker', 'yara.nelson',
  'zoe.carter', 'alex.mitchell', 'blake.perez', 'casey.roberts', 'drew.turner',
  'eli.phillips', 'finn.campbell', 'gina.parker', 'hugo.evans', 'ivy.edwards',
  'jay.collins', 'kira.stewart', 'leo.sanchez', 'mia.morris', 'nate.rogers',
  'owen.reed', 'pia.cook', 'quinn.bailey', 'rex.rivera', 'sara.cooper',
  'troy.richardson', 'una.cox', 'vex.ward', 'will.torres', 'xara.peterson'
];

const insightTitles = [
  'Improve Data Documentation Practices',
  'Enhance Cross-Team Collaboration',
  'Increase Data Reuse Efficiency',
  'Optimize Discovery Workflows',
  'Standardize Analysis Methods',
  'Low Documentation Score Detected',
  'Declining Collaboration Metrics',
  'Data Silos Identified',
  'Inconsistent Analysis Quality',
  'Resource Utilization Concerns',
  'Exceptional Discovery Performance',
  'Outstanding Collaboration Growth',
  'Documentation Excellence Achieved',
  'Data Reuse Milestone Reached',
  'Cross-Team Innovation Success'
];

const insightDescriptions = [
  'Teams could benefit from more structured documentation of data sources and analysis methods.',
  'Implementing regular cross-functional data reviews could improve collaboration scores.',
  'Creating a centralized data catalog would increase reuse efficiency across teams.',
  'Streamlining data discovery processes could reduce time-to-insight.',
  'Establishing common analysis frameworks would improve consistency.',
  'Several teams show declining documentation quality that may impact knowledge transfer.',
  'Collaboration scores have decreased by 15% over the past month.',
  'Data silos are forming between departments, reducing overall efficiency.',
  'Analysis quality varies significantly across teams, indicating need for standards.',
  'Some teams are underutilizing available data resources and tools.',
  'The Engineering team has achieved a 95% discovery score, setting a new benchmark.',
  'Collaboration scores have improved by 25% following new workflow implementation.',
  'Documentation quality has reached enterprise-grade standards across all teams.',
  'Data reuse efficiency has increased by 40% through improved cataloging.',
  'Cross-team data initiatives have led to breakthrough insights and innovations.'
];

const activityTemplates = [
  'User {user} completed advanced analytics training',
  'Team {team} published new data documentation',
  'Cross-team collaboration session completed',
  'Data quality assessment finished for customer dataset',
  'New dashboard created by {user}',
  'Data source integration completed successfully',
  'Team {team} achieved documentation milestone',
  'User {user} shared reusable analysis template',
  'Monthly data review completed',
  'New insights generated from sales data analysis'
];

// Simple random number generator
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(days = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - (Math.random() * days * 24 * 60 * 60 * 1000));
  return past.toISOString();
}

function generateUserScores(count = 50) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    // Adjusted ranges to achieve ~61.2 average
    const discoveryScore = random(35, 95);
    const collaborationScore = random(40, 90);
    const documentationScore = random(45, 85);
    const reuseScore = random(30, 80);
    
    // Calculate weighted overall score
    const overallScore = (
      discoveryScore * 0.3 + 
      collaborationScore * 0.25 + 
      documentationScore * 0.25 + 
      reuseScore * 0.2
    );

    users.push({
      user_id: userNames[i] || `user_${i}`,
      overall_score: parseFloat(overallScore.toFixed(1)),
      discovery_score: parseFloat(discoveryScore.toFixed(1)),
      collaboration_score: parseFloat(collaborationScore.toFixed(1)),
      documentation_score: parseFloat(documentationScore.toFixed(1)),
      reuse_score: parseFloat(reuseScore.toFixed(1)),
      activity_count: randomInt(5, 150),
      last_active: randomDate(30),
      created_at: randomDate(365),
      updated_at: new Date().toISOString()
    });
  }
  
  // Sort by overall score descending
  return users.sort((a, b) => b.overall_score - a.overall_score);
}

function generateTeamMetrics(userScores, count = 9) {
  const teams = [];
  
  for (let i = 0; i < count; i++) {
    const department = departments[i];
    const memberCount = randomInt(3, 12);
    
    // Assign random users to this team
    const teamUsers = [];
    for (let j = 0; j < memberCount; j++) {
      teamUsers.push(userScores[randomInt(0, userScores.length - 1)]);
    }
    
    const avgScore = teamUsers.reduce((sum, user) => sum + user.overall_score, 0) / teamUsers.length;
    const avgDiscovery = teamUsers.reduce((sum, user) => sum + user.discovery_score, 0) / teamUsers.length;
    const avgCollaboration = teamUsers.reduce((sum, user) => sum + user.collaboration_score, 0) / teamUsers.length;
    const avgDocumentation = teamUsers.reduce((sum, user) => sum + user.documentation_score, 0) / teamUsers.length;
    const avgReuse = teamUsers.reduce((sum, user) => sum + user.reuse_score, 0) / teamUsers.length;

    teams.push({
      team_id: `team_${department.toLowerCase().replace(/\s+/g, '_')}`,
      team_name: `${department} Team`,
      member_count: memberCount,
      avg_score: parseFloat(avgScore.toFixed(1)),
      discovery_score: parseFloat(avgDiscovery.toFixed(1)),
      collaboration_score: parseFloat(avgCollaboration.toFixed(1)),
      documentation_score: parseFloat(avgDocumentation.toFixed(1)),
      reuse_score: parseFloat(avgReuse.toFixed(1)),
      created_at: randomDate(365),
      updated_at: new Date().toISOString()
    });
  }
  
  return teams.sort((a, b) => b.avg_score - a.avg_score);
}

function generateInsights(count = 25) {
  const insights = [];
  const types = ['recommendation', 'warning', 'achievement'];
  const impactLevels = ['low', 'medium', 'high'];
  const targetEntities = ['user', 'team', 'organization'];
  
  for (let i = 0; i < count; i++) {
    const titleIndex = i % insightTitles.length;
    const descIndex = i % insightDescriptions.length;
    
    insights.push({
      id: `insight_${i + 1}`,
      type: randomChoice(types),
      title: insightTitles[titleIndex],
      description: insightDescriptions[descIndex],
      impact_level: randomChoice(impactLevels),
      target_entity: randomChoice(targetEntities),
      target_id: `target_${randomInt(1, 100)}`,
      action_items: [
        'Review current processes',
        'Implement best practices',
        'Monitor progress metrics'
      ],
      priority_score: parseFloat(random(0, 100).toFixed(1)),
      status: 'active',
      created_at: randomDate(7),
      updated_at: new Date().toISOString()
    });
  }
  
  return insights.sort((a, b) => b.priority_score - a.priority_score);
}

function generateActivityTimeline(count = 30) {
  const activities = [];
  
  for (let i = 0; i < count; i++) {
    const template = randomChoice(activityTemplates);
    const description = template
      .replace('{user}', randomChoice(userNames))
      .replace('{team}', randomChoice(departments));

    activities.push({
      id: `activity_${i + 1}`,
      description: description,
      timestamp: randomDate(14),
      user_id: randomChoice(userNames),
      activity_type: randomChoice(['training', 'documentation', 'collaboration', 'analysis', 'integration']),
      created_at: randomDate(14)
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateSampleData() {
  console.log('Generating sample data...');
  
  const userScores = generateUserScores(50);
  const teamMetrics = generateTeamMetrics(userScores, 9);
  const insights = generateInsights(25);
  const activityTimeline = generateActivityTimeline(30);
  
  // Calculate organization metrics
  const totalUsers = userScores.length;
  const totalTeams = teamMetrics.length;
  const avgNeurascore = userScores.reduce((sum, user) => sum + user.overall_score, 0) / totalUsers;
  
  let maturityLevel = 'Emerging';
  if (avgNeurascore >= 75) maturityLevel = 'Advanced';
  else if (avgNeurascore >= 50) maturityLevel = 'Developing';
  else if (avgNeurascore >= 25) maturityLevel = 'Basic';

  const organization = {
    total_users: totalUsers,
    total_teams: totalTeams,
    avg_neurascore: parseFloat(avgNeurascore.toFixed(1)),
    data_maturity_level: maturityLevel
  };

  console.log(`Generated ${totalUsers} users, ${totalTeams} teams, ${insights.length} insights, ${activityTimeline.length} activities`);
  console.log(`Organization average score: ${avgNeurascore.toFixed(1)} (${maturityLevel})`);

  return {
    organization,
    user_scores: userScores,
    teams: teamMetrics,
    insights,
    activity_timeline: activityTimeline
  };
}

module.exports = {
  generateSampleData,
  generateUserScores,
  generateTeamMetrics,
  generateInsights,
  generateActivityTimeline
};
