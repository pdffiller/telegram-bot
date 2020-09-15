import { Table, Column, Model } from "sequelize-typescript";

@Table({ tableName: "options", timestamps: false })
class Option extends Model<Option> {
  @Column isCorrect: boolean;
  @Column text: string;
  @Column payload: string;
  @Column questId: number;
}

// const sequelize = require('./sequelize');
// const Sequelize = require('sequelize');

// const Option = sequelize.define('option', {
//   isCorrect: Sequelize.BOOLEAN,
//   text: Sequelize.STRING,
//   payload: Sequelize.STRING,
// }, { timestamps: false });

export default Option;
