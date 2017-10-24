const awilix = require('awilix');
const config = require('config');

const container = awilix.createContainer();
container.registerValue('config', config);
container.loadModules(config.awilix.modules, config.awilix.options);

// container.resolve('updatesHandler').run();

module.exports = container;