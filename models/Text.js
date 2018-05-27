const sequelize = require('./sequelize');
const Sequelize = require('sequelize');

const Text = sequelize.define('text', {
  name: { type: Sequelize.STRING, primaryKey: true },
  lang: Sequelize.STRING,
  text: Sequelize.STRING,
}, { timestamps: false });

module.exports = Text;
