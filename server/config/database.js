/**
 * Database configuration and initialization
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// Database configuration
const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/neurascore.db'),
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../../data/neurascore.db'),
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig);

/**
 * Initialize database connection and sync models
 */
async function initializeDatabase() {
  try {
    // Ensure data directory exists for SQLite
    const fs = require('fs');
    const dataDir = path.dirname(dbConfig.storage || path.join(__dirname, '../../data/neurascore.db'));
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Created data directory: ${dataDir}`);
    }

    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Import models
    const UserScore = require('../models/UserScore')(sequelize);
    const TeamMetrics = require('../models/TeamMetrics')(sequelize);
    const Insight = require('../models/Insight')(sequelize);
    const ProcessingStatus = require('../models/ProcessingStatus')(sequelize);

    // Define associations
    defineAssociations({ UserScore, TeamMetrics, Insight, ProcessingStatus });

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false }); // Don't force recreate in production
    logger.info('Database synchronized successfully');

    // Initialize default data
    await initializeDefaultData();

  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

/**
 * Define model associations
 */
function defineAssociations(models) {
  // Add associations here as needed
  // Example: models.UserScore.belongsTo(models.Team);
}

/**
 * Initialize default data
 */
async function initializeDefaultData() {
  try {
    const ProcessingStatus = require('../models/ProcessingStatus')(sequelize);
    
    // Check if processing status exists
    const existingStatus = await ProcessingStatus.findOne();
    if (!existingStatus) {
      await ProcessingStatus.create({
        status: 'idle',
        progress: 0,
        message: 'Ready to process data',
        last_updated: new Date(),
      });
      logger.info('Initialized default processing status');
    }

  } catch (error) {
    logger.error('Error initializing default data:', error);
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database:', error);
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
  closeDatabase,
};
