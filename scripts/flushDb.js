const models = require('../models');

models.sequelize.sync({ force: true }).then(() => process.exit());