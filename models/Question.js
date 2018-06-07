const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const Question = sequelize.define('question', {
  parentId: Sequelize.INTEGER,
  order: Sequelize.INTEGER,
  name: Sequelize.STRING,
  text: Sequelize.STRING(1024),
  type: Sequelize.STRING,
  limit: Sequelize.INTEGER,
  timeLimit: Sequelize.BIGINT,
}, { timestamps: false });

module.exports = Question;
