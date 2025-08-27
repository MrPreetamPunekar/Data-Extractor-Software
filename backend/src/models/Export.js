// backend/src/models/Export.js
// Export model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Export = sequelize.define('Export', {
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
  format: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['csv', 'xlsx']]
    }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  record_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  download_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'exports',
  timestamps: true,
  underscored: true
});

module.exports = Export;