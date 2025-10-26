"""
Simple sample data generator for NeuraScore platform
Generates realistic teams, users, and insights when no real data exists
"""

import random
import datetime
from typing import Dict, List, Any

# Sample company departments and roles
departments = [
    'Engineering', 'Data Science', 'Product Management', 'Marketing', 
    'Sales', 'Operations', 'Finance', 'Human Resources', 'Customer Success'
]

user_names = [
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
]

def random_date(days=30):
    """Generate a random date within the last N days"""
    now = datetime.datetime.now()
    past = now - datetime.timedelta(days=random.randint(0, days))
    return past.isoformat()

def generate_user_scores(count=50):
    """Generate realistic user scores with higher average"""
    users = []
    
    for i in range(count):
        # Adjusted ranges to achieve ~61.2 average
        discovery_score = random.uniform(35, 95)
        collaboration_score = random.uniform(40, 90)
        documentation_score = random.uniform(45, 85)
        reuse_score = random.uniform(30, 80)
        
        # Calculate weighted overall score
        overall_score = (
            discovery_score * 0.3 + 
            collaboration_score * 0.25 + 
            documentation_score * 0.25 + 
            reuse_score * 0.2
        )

        users.append({
            'user_id': user_names[i] if i < len(user_names) else f'user_{i}',
            'overall_score': round(overall_score, 1),
            'discovery_score': round(discovery_score, 1),
            'collaboration_score': round(collaboration_score, 1),
            'documentation_score': round(documentation_score, 1),
            'reuse_score': round(reuse_score, 1),
            'activity_count': random.randint(5, 150),
            'last_active': random_date(30),
            'created_at': random_date(365),
            'updated_at': datetime.datetime.now().isoformat()
        })
    
    # Sort by overall score descending
    return sorted(users, key=lambda x: x['overall_score'], reverse=True)

def generate_team_metrics(user_scores, count=9):
    """Generate team metrics based on user scores"""
    teams = []
    
    for i in range(count):
        department = departments[i]
        member_count = random.randint(3, 12)
        
        # Assign random users to this team
        team_users = random.sample(user_scores, min(member_count, len(user_scores)))
        
        avg_score = sum(user['overall_score'] for user in team_users) / len(team_users)
        avg_discovery = sum(user['discovery_score'] for user in team_users) / len(team_users)
        avg_collaboration = sum(user['collaboration_score'] for user in team_users) / len(team_users)
        avg_documentation = sum(user['documentation_score'] for user in team_users) / len(team_users)
        avg_reuse = sum(user['reuse_score'] for user in team_users) / len(team_users)

        teams.append({
            'team_id': f'team_{department.lower().replace(" ", "_")}',
            'team_name': f'{department} Team',
            'member_count': member_count,
            'avg_score': round(avg_score, 1),
            'discovery_score': round(avg_discovery, 1),
            'collaboration_score': round(avg_collaboration, 1),
            'documentation_score': round(avg_documentation, 1),
            'reuse_score': round(avg_reuse, 1),
            'created_at': random_date(365),
            'updated_at': datetime.datetime.now().isoformat()
        })
    
    return sorted(teams, key=lambda x: x['avg_score'], reverse=True)

def generate_insights(count=25):
    """Generate sample insights"""
    insights = []
    types = ['recommendation', 'warning', 'achievement']
    impact_levels = ['low', 'medium', 'high']
    
    insight_titles = [
        'Improve Data Documentation Practices',
        'Enhance Cross-Team Collaboration',
        'Increase Data Reuse Efficiency',
        'Optimize Discovery Workflows',
        'Standardize Analysis Methods'
    ]
    
    for i in range(count):
        insights.append({
            'id': f'insight_{i + 1}',
            'type': random.choice(types),
            'title': insight_titles[i % len(insight_titles)],
            'description': 'AI-generated recommendation for improving data literacy',
            'impact_level': random.choice(impact_levels),
            'target_entity': random.choice(['user', 'team', 'organization']),
            'target_id': f'target_{random.randint(1, 100)}',
            'action_items': [
                'Review current processes',
                'Implement best practices',
                'Monitor progress metrics'
            ],
            'priority_score': round(random.uniform(0, 100), 1),
            'status': 'active',
            'created_at': random_date(7),
            'updated_at': datetime.datetime.now().isoformat()
        })
    
    return sorted(insights, key=lambda x: x['priority_score'], reverse=True)

def generate_activity_timeline(count=30):
    """Generate activity timeline"""
    activities = []
    
    activity_templates = [
        'User {user} completed advanced analytics training',
        'Team {team} published new data documentation',
        'Cross-team collaboration session completed',
        'Data quality assessment finished',
        'New dashboard created by {user}'
    ]
    
    for i in range(count):
        template = random.choice(activity_templates)
        description = template.format(
            user=random.choice(user_names),
            team=random.choice(departments)
        )

        activities.append({
            'id': f'activity_{i + 1}',
            'description': description,
            'timestamp': random_date(14),
            'user_id': random.choice(user_names),
            'activity_type': random.choice(['training', 'documentation', 'collaboration', 'analysis', 'integration']),
            'created_at': random_date(14)
        })
    
    return sorted(activities, key=lambda x: x['timestamp'], reverse=True)

def generateSampleData():
    """Generate complete sample dataset"""
    print('Generating sample data...')
    
    user_scores = generate_user_scores(50)
    team_metrics = generate_team_metrics(user_scores, 9)
    insights = generate_insights(25)
    activity_timeline = generate_activity_timeline(30)
    
    # Calculate organization metrics
    total_users = len(user_scores)
    total_teams = len(team_metrics)
    avg_neurascore = sum(user['overall_score'] for user in user_scores) / total_users
    
    if avg_neurascore >= 75:
        maturity_level = 'Advanced'
    elif avg_neurascore >= 50:
        maturity_level = 'Developing'
    elif avg_neurascore >= 25:
        maturity_level = 'Basic'
    else:
        maturity_level = 'Emerging'

    organization = {
        'total_users': total_users,
        'total_teams': total_teams,
        'avg_neurascore': round(avg_neurascore, 1),
        'data_maturity_level': maturity_level
    }

    print(f'Generated {total_users} users, {total_teams} teams, {len(insights)} insights, {len(activity_timeline)} activities')
    print(f'Organization average score: {avg_neurascore:.1f} ({maturity_level})')

    return {
        'organization': organization,
        'user_scores': user_scores,
        'teams': team_metrics,
        'insights': insights,
        'activity_timeline': activity_timeline
    }
