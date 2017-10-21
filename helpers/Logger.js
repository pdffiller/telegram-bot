const winston = require('winston');
const _ = require('lodash');
const path = require('path');

module.exports = ({ config }) => {
  const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'info'
      }),
      new (winston.transports.File)({
        name: 'info-file',
        filename: path.resolve(config.logger.path, 'tg-chat-info.json'),
        level: 'info',
        json: true,
      }),
      new (winston.transports.File)({
        name: 'error-file',
        filename: path.resolve(config.logger.path, 'tg-chat-error.json'),
        level: 'error',
        json: true,
      })
    ]
  });

  function log(level, payload = {}, meta = {}) {
    logger.log(level, _.assign(payload, {
      app: 'telegram-chat-bot',
    }, meta))
  }

  return {
    info: _.curry(log)('info'),
    error: _.curry(log)('error'),
  }
  
};