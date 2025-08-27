// worker/src/models/index.js
// Sequelize models index file

const { sequelize } = require('../config/database');

// Import model definitions
const User = require('./User');
const Job = require('./Job');
const Record = require('./Record');
const Export = require('./Export');
const RawData = require('./RawData');
const ProxyServer = require('./ProxyServer');
const AuditLog = require('./AuditLog');

// Define model associations
User.hasMany(Job, {
  foreignKey: 'user_id',
  as: 'jobs'
});

Job.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Job.hasMany(Record, {
  foreignKey: 'job_id',
  as: 'records'
});

Record.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job'
});

Job.hasMany(Export, {
  foreignKey: 'job_id',
  as: 'exports'
});

Export.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job'
});

Job.hasMany(RawData, {
  foreignKey: 'job_id',
  as: 'rawData'
});

RawData.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Job,
  Record,
  Export,
  RawData,
  ProxyServer,
  AuditLog
};