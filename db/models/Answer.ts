import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'answers' })
class Answer extends Model<Answer> {
  @Column text: string;
  @Column timing: number;

  @Column userId: number;
  @Column questId: number;
  @Column questionId: number;
}

// const sequelize = require('./sequelize');
// const Sequelize = require('sequelize');

// const Answer = sequelize.define('answer', {
//   text: Sequelize.STRING,
//   timing: Sequelize.BIGINT,
// });

export default Answer;
