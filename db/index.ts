import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import config from 'config';

const dbConfig = {
  ...config.mysql,
  modelPaths: [__dirname + '/models']
}

export default new Sequelize(dbConfig as SequelizeOptions);