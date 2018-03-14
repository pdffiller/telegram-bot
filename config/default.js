const path = require('path');
const awilix = require('awilix');

module.exports = {

  awilix: {
    modules: [
      'routes/*',
      'controllers/*',
      'models/*',
      'helpers/*',
      'App.js'
    ],

    options: {
      formatName: 'camelCase',
      registrationOptions: { lifetime: awilix.Lifetime.SINGLETON, },
    }
  },

  getUpdates: {
    enabled: false,
    interval: 1000,
  },

  sassMiddleware: {
    src: path.join(__dirname, '../sass'),
    dest: path.join(__dirname, '../public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
  },

  mysql: {
    host: 'docker',
    user: 'root',
    password: 'root',
    database: 'pdffiller_quests'
  },

  logger: {
    path: 'log'
  },

  botId: '<bot_id>',

};
