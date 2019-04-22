const path = require('path');
const awilix = require('awilix');

module.exports = {
  getUpdates: {
    enabled: false,
    interval: 1000,
  },
  mysql: {
    host: '0.0.0.0',
    dialect: 'mysql',
    username: 'root',
    password: 'root',
    database: 'tg_new'
  },

  logger: {
    path: 'log'
  },

  botId: '<bot_id>',
  sendInterval: 800,
};
