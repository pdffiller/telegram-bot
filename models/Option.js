const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const Option = sequelize.define('option', {
  isCorrect: Sequelize.BOOLEAN,
  text: Sequelize.STRING,
  payload: Sequelize.STRING,
}, { timestamps: false });

module.exports = Option;
