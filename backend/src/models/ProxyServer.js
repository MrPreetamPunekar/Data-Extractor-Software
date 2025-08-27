// backend/src/models/ProxyServer.js
// ProxyServer model

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProxyServer = sequelize.define('ProxyServer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_used: {
    type: DataTypes.DATE,
    allowNull: true
  },
  success_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fail_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avg_response_time: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'proxy_servers',
  timestamps: true,
  underscored: true
});

module.exports = ProxyServer;