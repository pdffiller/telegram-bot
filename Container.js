const awilix = require('awilix');
const config = require('config');

const container = awilix.createContainer();
container.registerValue('config', config);
container.loadModules(config.awilix.modules, config.awilix.options);

if (process.env.GET_UPDATES === 'true') container.resolve('updatesHandler').run();

module.exports = container;