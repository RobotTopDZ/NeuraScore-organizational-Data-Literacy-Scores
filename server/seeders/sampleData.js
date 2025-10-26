/**
 * Sample data generator for NeuraScore platform
 * Generates realistic teams, users, and insights when no real data exists
 */

// Dynamic import for faker since it's an ES module
let faker;
(async () => {
  const fakerModule = await import('@faker-js/faker');
  faker = fakerModule.faker;
})();

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

const insightTypes = ['recommendation', 'warning', 'achievement'];
const impactLevels = ['low', 'medium', 'high'];
const targetEntities = ['user', 'team', 'organization'];

function generateUserScores(count = 50) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const discoveryScore = faker.number.float({ min: 15, max: 95, precision: 0.1 });
    const collaborationScore = faker.number.float({ min: 10, max: 90, precision: 0.1 });
    const documentationScore = faker.number.float({ min: 20, max: 85, precision: 0.1 });
    const reuseScore = faker.number.float({ min: 5, max: 80, precision: 0.1 });
    
    // Calculate weighted overall score
    const overallScore = (
      discoveryScore * 0.3 + 
      collaborationScore * 0.25 + 
      documentationScore * 0.25 + 
      reuseScore * 0.2
    );

    users.push({
      user_id: faker.internet.userName().toLowerCase(),
      overall_score: parseFloat(overallScore.toFixed(1)),
      discovery_score: discoveryScore,
      collaboration_score: collaborationScore,
      documentation_score: documentationScore,
      reuse_score: reuseScore,
      activity_count: faker.number.int({ min: 5, max: 150 }),
      last_active: faker.date.recent({ days: 30 }).toISOString(),
      created_at: faker.date.past({ years: 2 }).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Sort by overall score descending
  return users.sort((a, b) => b.overall_score - a.overall_score);
}

function generateTeamMetrics(userScores, count = 12) {
  const teams = [];
  
  for (let i = 0; i < count; i++) {
    const department = departments[i % departments.length];
    const memberCount = faker.number.int({ min: 3, max: 12 });
    
    // Assign random users to this team
    const teamUsers = faker.helpers.arrayElements(userScores, memberCount);
    
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
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return teams.sort((a, b) => b.avg_score - a.avg_score);
}

function generateInsights(count = 25) {
  const insights = [];
  
  const insightTemplates = [
    {
      type: 'recommendation',
      titles: [
        'Improve Data Documentation Practices',
        'Enhance Cross-Team Collaboration',
        'Increase Data Reuse Efficiency',
        'Optimize Discovery Workflows',
        'Standardize Analysis Methods'
      ],
      descriptions: [
        'Teams could benefit from more structured documentation of data sources and analysis methods.',
        'Implementing regular cross-functional data reviews could improve collaboration scores.',
        'Creating a centralized data catalog would increase reuse efficiency across teams.',
        'Streamlining data discovery processes could reduce time-to-insight.',
        'Establishing common analysis frameworks would improve consistency.'
      ]
    },
    {
      type: 'warning',
      titles: [
        'Low Documentation Score Detected',
        'Declining Collaboration Metrics',
        'Data Silos Identified',
        'Inconsistent Analysis Quality',
        'Resource Utilization Concerns'
      ],
      descriptions: [
        'Several teams show declining documentation quality that may impact knowledge transfer.',
        'Collaboration scores have decreased by 15% over the past month.',
        'Data silos are forming between departments, reducing overall efficiency.',
        'Analysis quality varies significantly across teams, indicating need for standards.',
        'Some teams are underutilizing available data resources and tools.'
      ]
    },
    {
      type: 'achievement',
      titles: [
        'Exceptional Discovery Performance',
        'Outstanding Collaboration Growth',
        'Documentation Excellence Achieved',
        'Data Reuse Milestone Reached',
        'Cross-Team Innovation Success'
      ],
      descriptions: [
        'The Engineering team has achieved a 95% discovery score, setting a new benchmark.',
        'Collaboration scores have improved by 25% following new workflow implementation.',
        'Documentation quality has reached enterprise-grade standards across all teams.',
        'Data reuse efficiency has increased by 40% through improved cataloging.',
        'Cross-team data initiatives have led to breakthrough insights and innovations.'
      ]
    }
  ];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(insightTypes);
    const template = insightTemplates.find(t => t.type === type);
    const titleIndex = faker.number.int({ min: 0, max: template.titles.length - 1 });
    
    insights.push({
      id: faker.string.uuid(),
      type: type,
      title: template.titles[titleIndex],
      description: template.descriptions[titleIndex],
      impact_level: faker.helpers.arrayElement(impactLevels),
      target_entity: faker.helpers.arrayElement(targetEntities),
      target_id: faker.string.alphanumeric(8),
      action_items: [
        faker.company.buzzPhrase(),
        faker.company.buzzPhrase(),
        faker.company.buzzPhrase()
      ],
      priority_score: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
      status: 'active',
      created_at: faker.date.recent({ days: 7 }).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return insights.sort((a, b) => b.priority_score - a.priority_score);
}

function generateActivityTimeline(count = 30) {
  const activities = [];
  
  const activityTemplates = [
    'User {user} completed advanced analytics training',
    'Team {team} published new data documentation',
    'Cross-team collaboration session completed',
    'Data quality assessment finished for {dataset}',
    'New dashboard created by {user}',
    'Data source {source} integrated successfully',
    'Team {team} achieved documentation milestone',
    'User {user} shared reusable analysis template',
    'Monthly data review completed',
    'New insights generated from {dataset} analysis'
  ];

  for (let i = 0; i < count; i++) {
    const template = faker.helpers.arrayElement(activityTemplates);
    const description = template
      .replace('{user}', faker.internet.userName())
      .replace('{team}', faker.helpers.arrayElement(departments))
      .replace('{dataset}', faker.database.collation())
      .replace('{source}', faker.company.name());

    activities.push({
      id: faker.string.uuid(),
      description: description,
      timestamp: faker.date.recent({ days: 14 }).toISOString(),
      user_id: faker.internet.userName(),
      activity_type: faker.helpers.arrayElement(['training', 'documentation', 'collaboration', 'analysis', 'integration']),
      created_at: faker.date.recent({ days: 14 }).toISOString()
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateSampleData() {
  console.log('Generating sample data...');
  
  const userScores = generateUserScores(50);
  const teamMetrics = generateTeamMetrics(userScores, 12);
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
