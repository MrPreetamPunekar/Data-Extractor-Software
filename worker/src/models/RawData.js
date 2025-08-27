<<<<<<< HEAD
// worker/src/models/RawData.js
// RawData model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RawData = sequelize.define('RawData', {
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
  source_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content_type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['html', 'json', 'text']]
    }
  },
  http_status: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  scrape_duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tos_compliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  requires_review: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  captcha_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'raw_data',
  timestamps: true,
  underscored: true
});

=======
// worker/src/models/RawData.js
// RawData model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RawData = sequelize.define('RawData', {
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
  source_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content_type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['html', 'json', 'text']]
    }
  },
  http_status: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  scrape_duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tos_compliant: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  requires_review: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  captcha_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'raw_data',
  timestamps: true,
  underscored: true
});

>>>>>>> e5d4683 (Initial commit)
module.exports = RawData;