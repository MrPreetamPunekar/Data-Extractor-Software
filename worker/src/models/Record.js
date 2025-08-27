// worker/src/models/Record.js
// Record model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Record = sequelize.define('Record', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  source_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 1.00
    }
  },
  is_duplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_valid: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  phone_valid: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}, {
  tableName: 'records',
  timestamps: true,
  underscored: true
});

module.exports = Record;