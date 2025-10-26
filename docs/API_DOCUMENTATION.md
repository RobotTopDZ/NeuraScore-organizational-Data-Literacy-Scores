# NeuraScore API Documentation

## Overview

The NeuraScore API provides comprehensive endpoints for data literacy analytics, machine learning insights, and reporting capabilities. The API is built with Express.js and follows RESTful principles.

## Base URLs

- **Backend API**: `http://localhost:3000/api`
- **ML Services**: `http://localhost:8001/analytics`

## Authentication

Currently, the API operates without authentication for development purposes. In production, implement JWT-based authentication.

## Core API Endpoints

### Dashboard Analytics

#### Get Dashboard Overview
```http
GET /api/dashboard
```

**Description**: Retrieves comprehensive dashboard data including organization metrics, user scores, team performance, and insights.

**Response**:
```json
{
  "success": true,
  "data": {
    "organization": {
      "total_users": 50,
      "total_teams": 9,
      "avg_neurascore": 63.7,
      "data_maturity_level": "Developing"
    },
    "user_scores": [...],
    "teams": [...],
    "insights": [...],
    "activity_timeline": [...]
  },
  "timestamp": "2025-10-26T18:43:55.000Z",
  "source": "sample"
}
```

### Team Management

#### Get All Teams
```http
GET /api/teams
```

**Description**: Returns all teams with their performance metrics and member counts.

**Response**:
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "team_id": "team_data_science",
        "team_name": "Data Science Team",
        "member_count": 9,
        "avg_score": 65.2,
        "discovery_score": 72.1,
        "collaboration_score": 68.3,
        "documentation_score": 61.4,
        "reuse_score": 58.9
      }
    ],
    "total": 9
  }
}
```

### User Analytics

#### Get User Scores
```http
GET /api/users/scores?page=1&limit=20&search=john
```

**Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)
- `search` (optional): Search term for filtering users

**Response**:
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "user_id": "john.doe",
        "overall_score": 75.4,
        "discovery_score": 82.1,
        "collaboration_score": 71.2,
        "documentation_score": 68.9,
        "reuse_score": 79.3,
        "activity_count": 142,
        "last_active": "2025-10-25T14:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Reporting

#### Get Reports Data
```http
GET /api/reports?type=overview
```

**Parameters**:
- `type` (optional): Report type (default: overview)

#### Export Reports
```http
GET /api/reports/export?format=pdf&type=dashboard
```

**Parameters**:
- `format`: Export format (pdf, html, csv)
- `type`: Report type (dashboard, team, user)

**PDF/HTML Response**:
```json
{
  "success": true,
  "data": {
    "format": "html",
    "content": "<html>...</html>",
    "filename": "neurascore-dashboard-report-123456.html",
    "message": "Report generated successfully",
    "instructions": "Copy content and save as .html file, then print to PDF"
  }
}
```

**CSV Response**: Direct file download with appropriate headers.

## Machine Learning API Endpoints

### User Pattern Analysis

#### Analyze User Behavior Patterns
```http
GET /analytics/user-patterns
```

**Description**: Uses ML clustering to identify user behavior patterns and segments.

**Response**:
```json
{
  "success": true,
  "data": {
    "total_users": 50,
    "clusters": {
      "cluster_0": {
        "name": "Data Explorers",
        "size": 15,
        "avg_scores": {
          "discovery_score": 78.2,
          "collaboration_score": 65.1,
          "documentation_score": 58.9,
          "reuse_score": 71.4
        },
        "characteristics": ["High discovery", "Good collaboration"],
        "recommendations": ["Focus on documentation skills"]
      }
    },
    "insights": [
      "Largest user group: Data Explorers (15 users)",
      "Total of 4 distinct user behavior patterns identified"
    ]
  },
  "analysis_type": "user_patterns",
  "timestamp": "2025-10-26T18:43:55.000Z"
}
```

### Performance Predictions

#### Get Performance Trend Predictions
```http
GET /analytics/performance-predictions
```

**Description**: Generates ML-based predictions for future performance trends.

**Response**:
```json
{
  "success": true,
  "data": {
    "current_avg_score": 63.7,
    "predictions": [
      {
        "days_ahead": 7,
        "predicted_avg_score": 65.2,
        "score_change": 1.5,
        "confidence": 0.87
      },
      {
        "days_ahead": 14,
        "predicted_avg_score": 66.8,
        "score_change": 3.1,
        "confidence": 0.82
      },
      {
        "days_ahead": 30,
        "predicted_avg_score": 68.4,
        "score_change": 4.7,
        "confidence": 0.75
      }
    ],
    "feature_importance": {
      "discovery_score": 0.35,
      "collaboration_score": 0.28,
      "documentation_score": 0.22,
      "reuse_score": 0.15
    },
    "insights": [
      "Positive trend: Scores expected to improve by 4.7 points over 30 days"
    ]
  }
}
```

### NLP Insights

#### Get NLP Text Analysis
```http
GET /analytics/nlp-insights
```

**Description**: Analyzes organizational text data using natural language processing.

**Response**:
```json
{
  "success": true,
  "data": {
    "sentiment_analysis": {
      "positive": 0.65,
      "neutral": 0.25,
      "negative": 0.10
    },
    "key_topics": [
      {
        "topic": "Data Quality",
        "frequency": 0.35,
        "sentiment": 0.7
      },
      {
        "topic": "Collaboration",
        "frequency": 0.28,
        "sentiment": 0.8
      }
    ],
    "trending_keywords": [
      "data visualization",
      "machine learning",
      "analytics",
      "dashboard"
    ],
    "recommendations": [
      "Focus on improving data quality processes",
      "Enhance cross-team collaboration initiatives"
    ]
  }
}
```

### Predictive Alerts

#### Get Predictive Alerts
```http
GET /analytics/predictive-alerts
```

**Description**: Generates predictive alerts for performance risks and opportunities.

**Response**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "performance_risk",
        "severity": "high",
        "title": "5 Users at Performance Risk",
        "description": "Users showing declining performance patterns",
        "affected_users": ["user1", "user2", "user3"],
        "recommendation": "Provide targeted training and support"
      }
    ],
    "total_alerts": 3,
    "high_priority": 1,
    "medium_priority": 2
  }
}
```

### Skill Gap Analysis

#### Analyze Organizational Skill Gaps
```http
GET /analytics/skill-gap-analysis
```

**Description**: Identifies skill gaps across the organization with recommendations.

**Response**:
```json
{
  "success": true,
  "data": {
    "skill_analysis": {
      "Discovery": {
        "average_score": 68.4,
        "low_performers": 8,
        "high_performers": 15,
        "gap_severity": "medium",
        "recommendations": [
          "Focus training on discovery skills",
          "Pair high performers with those needing improvement"
        ]
      }
    },
    "overall_insights": [
      "Organization has 50 users analyzed",
      "Average performance across all skills: 63.7",
      "Focus areas identified for targeted improvement"
    ]
  }
}
```

### Industry Benchmarking

#### Get Benchmarking Report
```http
GET /analytics/benchmarking
```

**Description**: Compares organizational performance against industry standards.

**Response**:
```json
{
  "success": true,
  "data": {
    "benchmarking": {
      "discovery_score": {
        "organization_average": 68.4,
        "industry_benchmark": 65.0,
        "difference": 3.4,
        "performance": "above",
        "percentile": 65
      }
    },
    "summary": {
      "above_benchmark": 3,
      "below_benchmark": 2,
      "overall_ranking": "Upper quartile"
    }
  }
}
```

### Custom Analysis

#### Run Custom Analysis
```http
POST /analytics/custom-analysis
```

**Request Body**:
```json
{
  "analysis_type": "correlation_analysis",
  "parameters": {
    "include_teams": true,
    "date_range": "30d"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "correlation_matrix": {
      "discovery_score": {
        "collaboration_score": 0.45,
        "documentation_score": 0.32,
        "reuse_score": 0.28
      }
    },
    "insights": [
      "Strong correlation between collaboration and documentation scores",
      "Discovery skills show independence from other metrics"
    ]
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2025-10-26T18:43:55.000Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

- Development: No rate limiting
- Production: 1000 requests per hour per IP

## Data Types

### User Score Object
```typescript
interface UserScore {
  user_id: string;
  overall_score: number;
  discovery_score: number;
  collaboration_score: number;
  documentation_score: number;
  reuse_score: number;
  activity_count: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}
```

### Team Metrics Object
```typescript
interface TeamMetrics {
  team_id: string;
  team_name: string;
  member_count: number;
  avg_score: number;
  discovery_score: number;
  collaboration_score: number;
  documentation_score: number;
  reuse_score: number;
  created_at: string;
  updated_at: string;
}
```

### Insight Object
```typescript
interface Insight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high';
  target_entity: 'user' | 'team' | 'organization';
  target_id: string;
  action_items: string[];
  priority_score: number;
  status: 'active' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class NeuraScoreAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.client = axios.create({ baseURL });
  }

  async getDashboard() {
    const response = await this.client.get('/dashboard');
    return response.data;
  }

  async getUserScores(page = 1, limit = 20, search = '') {
    const response = await this.client.get('/users/scores', {
      params: { page, limit, search }
    });
    return response.data;
  }

  async exportReport(format = 'pdf', type = 'dashboard') {
    const response = await this.client.get('/reports/export', {
      params: { format, type }
    });
    return response.data;
  }
}

// Usage
const api = new NeuraScoreAPI();
const dashboard = await api.getDashboard();
console.log(`Average Score: ${dashboard.data.organization.avg_neurascore}`);
```

### Python
```python
import requests

class NeuraScoreAPI:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url

    def get_dashboard(self):
        response = requests.get(f'{self.base_url}/dashboard')
        return response.json()

    def get_user_scores(self, page=1, limit=20, search=''):
        params = {'page': page, 'limit': limit, 'search': search}
        response = requests.get(f'{self.base_url}/users/scores', params=params)
        return response.json()

    def export_report(self, format='pdf', type='dashboard'):
        params = {'format': format, 'type': type}
        response = requests.get(f'{self.base_url}/reports/export', params=params)
        return response.json()

# Usage
api = NeuraScoreAPI()
dashboard = api.get_dashboard()
print(f"Average Score: {dashboard['data']['organization']['avg_neurascore']}")
```

## Testing

Use the provided test scripts to verify API functionality:

```bash
# Test all features
node test-advanced-features.js

# Test PDF export specifically
node test-pdf-export.js
```

## Support

For API support and questions:
- Review this documentation
- Check the troubleshooting section in README.md
- Create an issue in the GitHub repository
