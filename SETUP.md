# NeuraScore Setup Guide

This guide will help you set up and run the NeuraScore platform locally and deploy it to Railway.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd NeuraScore

# Install all dependencies (root, frontend, server, and Python services)
npm run install:all
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# The default settings work for local development
```

### 3. Start Development Servers

```bash
# Start all services (frontend, backend, and Python services)
npm run dev
```

This will start:
- Frontend (Next.js): http://localhost:3001
- Backend (Express.js): http://localhost:3000
- Python Services (FastAPI): http://localhost:8000

### 4. Process Data

1. Open your browser to http://localhost:3001
2. The dashboard will show "No data available" initially
3. Click the "Refresh" button or go to the processing section to trigger data processing
4. The Python services will process the data files and calculate NeuraScores

## Manual Setup (Alternative)

If the automated setup doesn't work, follow these manual steps:

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Python Services Setup

```bash
cd python-services
pip install -r requirements.txt
python main.py
```

## Data Processing

The platform processes two main data files:

- `data/2019_search_log_sessioned.txt` - User interaction logs
- `data/id_to_title_subject.csv` - Dataset metadata

### Initial Data Processing

1. **Trigger Processing**: POST to `/api/processing/trigger`
2. **Check Status**: GET `/api/processing/status`
3. **Calculate Scores**: POST `/api/processing/scores/recalculate`

### API Endpoints

The platform provides several API endpoints:

- **Dashboard**: `/api/dashboard` - Overview data
- **Users**: `/api/users/scores` - User scores and leaderboard
- **Teams**: `/api/teams` - Team metrics
- **Insights**: `/api/insights` - AI-generated recommendations
- **Processing**: `/api/processing/status` - Data processing status
- **Health**: `/api/health` - System health check

## Railway Deployment

### Prerequisites

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`

### Deploy Steps

1. **Create Railway Project**
   ```bash
   railway init
   ```

2. **Configure Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set PYTHON_SERVICES_URL=http://localhost:8000
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Railway Configuration

The project includes:
- `railway.json` - Railway deployment configuration
- `Dockerfile` - Multi-stage Docker build
- Automatic health checks on `/api/health`

### Environment Variables for Production

Set these in Railway dashboard:

```
NODE_ENV=production
PORT=3000
DB_DIALECT=sqlite
LOG_LEVEL=info
JWT_SECRET=your-secure-jwt-secret
```

## Architecture Overview

```
NeuraScore/
├── frontend/          # Next.js React application
│   ├── src/app/       # App router pages
│   ├── src/components/ # Reusable components
│   ├── src/lib/       # Utilities and API client
│   └── src/types/     # TypeScript type definitions
├── server/            # Express.js backend
│   ├── routes/        # API route handlers
│   ├── models/        # Database models (Sequelize)
│   ├── middleware/    # Express middleware
│   └── config/        # Configuration files
├── python-services/   # FastAPI ML/NLP services
│   ├── main.py        # FastAPI application
│   ├── data_processor.py      # Data processing pipeline
│   ├── neurascore_engine.py   # Scoring algorithm
│   ├── nlp_analyzer.py        # NLP analysis
│   └── insight_generator.py   # AI insights
└── data/             # Raw data files
```

## Features

### Core Functionality

- **Data Processing**: Automated parsing of user interaction logs
- **NeuraScore Algorithm**: Multi-dimensional scoring across 4 pillars:
  - Discovery (exploration activity)
  - Collaboration (team interaction patterns)
  - Documentation (query quality and metadata usage)
  - Reuse (frequency of dataset revisits)
- **Interactive Dashboard**: Real-time visualizations and metrics
- **AI Insights**: Automated recommendations for improving data literacy
- **Team Analytics**: Team-level performance metrics and comparisons

### Technical Features

- **Scalable Architecture**: Microservices with Express.js and FastAPI
- **Modern UI**: Next.js with TailwindCSS and responsive design
- **Real-time Updates**: Live data processing status and metrics
- **Export Capabilities**: PDF report generation
- **Health Monitoring**: Comprehensive health checks and logging
- **Database Flexibility**: SQLite for development, PostgreSQL for production

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Frontend: Change port in `frontend/package.json`
   - Backend: Set `PORT` environment variable
   - Python: Modify port in `python-services/main.py`

2. **Python Dependencies**
   ```bash
   cd python-services
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Database Issues**
   - Delete `data/neurascore.db` to reset database
   - Check file permissions in `data/` directory

4. **Memory Issues**
   - The data processor limits to 50K records for development
   - Increase limit in `data_processor.py` for full processing

### Development Tips

- Use `npm run dev` for hot reloading
- Check logs in `logs/` directory
- Monitor Python services at http://localhost:8000/docs
- Use browser dev tools for frontend debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper documentation
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs in `logs/` directory
3. Check API health at `/api/health`
4. Verify Python services at `http://localhost:8000`
