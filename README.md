# euraScore Analytics Platform

## Executive Summary

NeuraScore is an enterprise-grade data literacy assessment platform that leverages machine learning and natural language processing to evaluate organizational data maturity. The platform analyzes user behavior patterns, generates predictive insights, and provides actionable recommendations for improving data-driven decision making across teams and departments.

## Core Capabilities

### Advanced Analytics Engine
- **Machine Learning Clustering**: Automatically identifies user behavior patterns and segments users into performance categories
- **Predictive Analytics**: Forecasts performance trends and identifies at-risk users requiring intervention
- **NLP Text Analysis**: Processes organizational communications to extract sentiment and key topics
- **Benchmarking**: Compares organizational performance against industry standards

### Comprehensive Scoring Framework
- **Discovery Score**: Measures data exploration and search effectiveness
- **Collaboration Score**: Evaluates cross-team data sharing and communication
- **Documentation Score**: Assesses quality and completeness of data documentation
- **Reuse Score**: Tracks efficiency in leveraging existing data assets

### Professional Reporting Suite
- **Interactive Dashboards**: Real-time visualizations with drill-down capabilities
- **PDF Export**: Professional reports with insights, charts, and executive summaries
- **CSV Data Export**: Raw data extraction for further analysis
- **Automated Insights**: AI-generated recommendations and action items

## Technical Architecture

### Frontend Layer
- **Framework**: Next.js 14 with TypeScript for type safety
- **Styling**: TailwindCSS for responsive, modern UI design
- **State Management**: React hooks with optimized data fetching
- **Routing**: File-based routing with dynamic page generation

### Backend Services
- **API Server**: Express.js with RESTful endpoints
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Sequelize for database abstraction and migrations
- **Authentication**: JWT-based session management

### ML/AI Services
- **Framework**: FastAPI with Python for high-performance ML operations
- **Machine Learning**: Scikit-learn for clustering and prediction models
- **Data Processing**: Pandas and NumPy for efficient data manipulation
- **NLP**: Custom text analysis for sentiment and topic extraction

## Installation and Setup

### System Requirements
- Node.js 18.0 or higher
- Python 3.9 or higher
- 4GB RAM minimum (8GB recommended)
- 2GB available disk space

### Development Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/neurascore.git
   cd neurascore
   ```

2. **Install Node.js Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Setup Python Environment**
   ```bash
   cd python-services
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend (Port 3001)
   cd frontend
   npm run dev

   # Terminal 2: Backend API (Port 3000)
   cd server
   npm run dev

   # Terminal 3: Python ML Services (Port 8001)
   cd python-services
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Production Deployment

1. **Build Applications**
   ```bash
   # Build frontend
   cd frontend
   npm run build

   # Prepare backend
   cd ../server
   npm install --production
   ```

2. **Environment Configuration**
   ```bash
   # Create production environment file
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Start Production Services**
   ```bash
   # Start backend
   cd server
   NODE_ENV=production npm start

   # Start ML services
   cd ../python-services
   python -m uvicorn main:app --host 0.0.0.0 --port 8001

   # Serve frontend (use nginx or similar)
   cd ../frontend
   npm run start
   ```

## Project Structure

```
neurascore/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── analytics/      # Advanced analytics dashboard
│   │   │   ├── reports/        # Reporting interface
│   │   │   ├── teams/          # Team management
│   │   │   └── users/          # User management
│   │   └── components/         # Reusable UI components
│   │       └── layout/         # Layout components
│   ├── public/                 # Static assets
│   └── package.json
│
├── server/                     # Express.js Backend API
│   ├── config/                 # Database and app configuration
│   ├── models/                 # Sequelize database models
│   ├── routes/                 # API endpoint definitions
│   │   ├── dashboard.js        # Dashboard data endpoints
│   │   ├── reports.js          # Report generation
│   │   ├── teams.js            # Team management API
│   │   └── users.js            # User management API
│   ├── seeders/                # Database seeding utilities
│   ├── utils/                  # Utility functions
│   │   └── pdfGenerator.js     # PDF report generation
│   └── index.js                # Application entry point
│
├── python-services/            # ML/AI Microservices
│   ├── advanced_analytics_api.py  # ML analytics endpoints
│   ├── advanced_insights.py       # ML insights engine
│   ├── sample_data_generator.py   # Sample data utilities
│   ├── main.py                    # FastAPI application
│   └── requirements.txt           # Python dependencies
│
├── docs/                       # Documentation
│   ├── API.md                  # API documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── DEVELOPMENT.md          # Development guide
│
└── README.md                   # This file
```

## API Documentation

### Core Endpoints

#### Dashboard API
- `GET /api/dashboard` - Retrieve dashboard overview data
- `GET /api/teams` - List all teams with performance metrics
- `GET /api/users/scores` - Get user scores with pagination

#### Advanced Analytics API
- `GET /analytics/user-patterns` - ML-powered user behavior clustering
- `GET /analytics/performance-predictions` - Predictive performance analysis
- `GET /analytics/nlp-insights` - NLP text analysis results
- `GET /analytics/predictive-alerts` - Risk and opportunity alerts

#### Reporting API
- `GET /api/reports` - Generate comprehensive reports
- `GET /api/reports/export?format=pdf` - Export PDF reports
- `GET /api/reports/export?format=csv` - Export CSV data

### Sample API Response

```json
{
  "success": true,
  "data": {
    "organization": {
      "total_users": 50,
      "total_teams": 9,
      "avg_neurascore": 61.2,
      "data_maturity_level": "Developing"
    },
    "user_scores": [...],
    "teams": [...],
    "insights": [...]
  },
  "timestamp": "2025-10-26T18:00:00.000Z",
  "source": "database"
}
```

## Configuration

### Environment Variables

#### Backend Configuration (.env)
```bash
# Database Configuration
DATABASE_URL=sqlite:./neurascore.db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neurascore
DB_USER=neurascore_user
DB_PASS=secure_password

# Application Settings
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# External Services
PYTHON_SERVICES_URL=http://localhost:8001
```

#### Frontend Configuration
```bash
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_API_URL=http://localhost:8001
```

## Data Management

### Sample Data Generation
The platform includes intelligent sample data generation for development and demonstration purposes:

- **50 Realistic Users** with varying performance levels
- **9 Department Teams** with calculated metrics
- **25 AI-Generated Insights** with different impact levels
- **30 Activity Timeline Entries** showing recent interactions

### Real Data Integration
For production use, integrate with your existing data sources:

1. **User Activity Logs**: Import from data catalog systems
2. **Team Structure**: Sync with HR or directory services
3. **Documentation Metrics**: Connect to knowledge management systems
4. **Collaboration Data**: Integrate with communication platforms

## Performance Optimization

### Frontend Optimization
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Caching strategies for API responses
- Lazy loading for dashboard components

### Backend Optimization
- Database indexing for frequently queried fields
- Connection pooling for database efficiency
- Response compression for API endpoints
- Caching layer for expensive computations

### ML Services Optimization
- Model caching to reduce computation time
- Batch processing for large datasets
- Asynchronous processing for heavy operations
- Memory optimization for data processing

## Security Considerations

### Authentication & Authorization
- JWT-based session management
- Role-based access control (RBAC)
- API rate limiting and throttling
- Input validation and sanitization

### Data Protection
- Encrypted data transmission (HTTPS)
- Database encryption at rest
- Personal data anonymization options
- GDPR compliance features

## Monitoring and Logging

### Application Monitoring
- Structured logging with Winston
- Performance metrics collection
- Error tracking and alerting
- Health check endpoints

### Analytics Monitoring
- ML model performance tracking
- Data quality monitoring
- User engagement metrics
- System performance dashboards

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database credentials in .env file
   - Ensure database server is running
   - Check network connectivity

2. **ML Services Not Responding**
   - Verify Python dependencies are installed
   - Check if FastAPI server is running on port 8001
   - Review Python service logs for errors

3. **Frontend Build Failures**
   - Clear node_modules and reinstall dependencies
   - Verify Node.js version compatibility
   - Check for TypeScript compilation errors

### Performance Issues
- Monitor database query performance
- Check for memory leaks in long-running processes
- Optimize large dataset processing
- Review API response times

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper documentation
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices for frontend
- Use ESLint and Prettier for code formatting
- Write comprehensive JSDoc comments
- Maintain test coverage above 80%

### Documentation Requirements
- Update API documentation for new endpoints
- Add inline code comments for complex logic
- Update README for new features
- Include migration guides for breaking changes

## License

MIT License - see LICENSE file for complete terms and conditions.

## Support

For technical support and questions:
- Create an issue in the GitHub repository
- Review existing documentation in the `/docs` folder
- Check the troubleshooting section above

## Changelog

### Version 2.0.0 (Current)
- Added advanced ML analytics with user behavior clustering
- Implemented predictive performance analytics
- Enhanced NLP text analysis capabilities
- Professional PDF report generation
- Comprehensive benchmarking features
- Improved sample data generation
- Enhanced security and performance optimizations

### Version 1.0.0
- Initial release with basic dashboard functionality
- Core scoring framework implementation
- Basic reporting capabilities
- Sample data integration
