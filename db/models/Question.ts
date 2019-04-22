import { Table, Column, Model } from 'sequelize-typescript'


enum TYPE {
  GROUP = 'group',
  SELECT = 'select',
  TEXT = 'text',
  CONTACT = 'contact',
  NAME = 'name',
  EMAIL = 'email',
  GOTO = 'goto',
}

@Table({ tableName: 'questions', timestamps: false })
class Question extends Model<Question> {
  @Column parentId: number;
  @Column order: number;
  @Column name: string;
  @Column text: string;
  @Column type: string;
  @Column limit: number;
  @Column timeLimit: number;

  @Column questId: number;


  public static TYPE = TYPE;
}

// const sequelize = require('./sequelize');
// const Sequelize = require('sequelize');

// const Question = sequelize.define('question', {
//   parentId: Sequelize.INTEGER,
//   order: Sequelize.INTEGER,
//   name: Sequelize.STRING,
//   text: Sequelize.STRING(1024),
//   type: Sequelize.STRING,
//   limit: Sequelize.INTEGER,
//   timeLimit: Sequelize.BIGINT,
// }, { timestamps: false });

export default Question;
