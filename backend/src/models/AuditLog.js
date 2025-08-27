<<<<<<< HEAD
// backend/src/models/AuditLog.js
// AuditLog model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['scrape', 'export', 'login', 'config_change', 'job_create', 'job_update', 'job_delete']]
    }
  },
  resource_type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['job', 'record', 'export', 'user', 'config']]
    }
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true
});

=======
// backend/src/models/AuditLog.js
// AuditLog model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['scrape', 'export', 'login', 'config_change', 'job_create', 'job_update', 'job_delete']]
    }
  },
  resource_type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['job', 'record', 'export', 'user', 'config']]
    }
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true
});

>>>>>>> e5d4683 (Initial commit)
module.exports = AuditLog;