const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const Answer = sequelize.define('answer', {
  text: Sequelize.STRING,
  timing: Sequelize.BIGINT,
});

module.exports = Answer;
