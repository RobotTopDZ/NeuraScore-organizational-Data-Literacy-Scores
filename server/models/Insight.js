/**
 * Insight model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Insight = sequelize.define('Insight', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('recommendation', 'warning', 'achievement'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    impact_level: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    target_entity: {
      type: DataTypes.ENUM('user', 'team', 'organization'),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    action_items: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    priority_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'dismissed'),
      allowNull: false,
      defaultValue: 'active',
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'insights',
    indexes: [
      {
        fields: ['target_entity', 'target_id'],
      },
      {
        fields: ['impact_level'],
      },
      {
        fields: ['priority_score'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  });

  return Insight;
};
