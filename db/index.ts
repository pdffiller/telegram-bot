import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import config from 'config';

console.log(config.mysql);


const dbConfig = {
  ...config.mysql,
  modelPaths: [__dirname + '/models']
}

export default new Sequelize(dbConfig as SequelizeOptions);