const path = require('path');
const awilix = require('awilix');

module.exports = {
  mysql: {
    host: '0.0.0.0',
    dialect: 'mysql',
    username: 'root',
    password: 'root',
    database: 'tg_new'
  },

  spreadSheets: {
    credentialsPath: './credentials.json',
    tokenPath: './token.json',
  },

  botId: '<bot_id>',
};
