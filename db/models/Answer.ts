import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Option from './Option';
import Question from './Question';

@Table({ tableName: 'answers' })
class Answer extends Model<Answer> {
  @Column text: string;
  @Column timing: number;

  @Column userId: number;
  @Column questId: number;
  
  @ForeignKey(() => Option)
  @Column optionId: number;

  @BelongsTo(() => Option)
  option: Option;


  @ForeignKey(() => Question)
  @Column questionId: number;

  @BelongsTo(() => Question)
  question: Question;

}

// const sequelize = require('./sequelize');
// const Sequelize = require('sequelize');

// const Answer = sequelize.define('answer', {
//   text: Sequelize.STRING,
//   timing: Sequelize.BIGINT,
// });

export default Answer;
