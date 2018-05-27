const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const Quest = sequelize.define('quest', {
  name: Sequelize.STRING,
  startText: Sequelize.STRING,
  endText: Sequelize.STRING,
  helpText: Sequelize.STRING,
  retryText: Sequelize.STRING,
  errorText: Sequelize.STRING,
  timeoutText: Sequelize.STRING,
  isDefault: Sequelize.BOOLEAN,
}, { timestamps: false });

module.exports = Quest;