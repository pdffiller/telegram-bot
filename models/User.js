const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const User = sequelize.define('user', {
  telegramId: Sequelize.INTEGER,
  username: Sequelize.STRING,
  timing: Sequelize.BIGINT,
});

module.exports = User;
