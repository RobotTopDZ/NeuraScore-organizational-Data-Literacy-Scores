/**
 * ProcessingStatus model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProcessingStatus = sequelize.define('ProcessingStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM('idle', 'processing', 'completed', 'error'),
      allowNull: false,
      defaultValue: 'idle',
    },
    progress: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Ready to process data',
    },
    error_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'processing_status',
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['last_updated'],
      },
    ],
  });

  return ProcessingStatus;
};
