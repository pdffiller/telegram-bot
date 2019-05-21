import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'quests', timestamps: false })
class Quest extends Model<Quest> {
  @Column name: string;
  @Column startText: string;
  @Column endText: string;
  @Column helpText: string;
  @Column retryText: string;
  @Column disabledText: string;
  @Column errorText: string;
  @Column timeoutText: string;
  @Column isDefault: boolean;
  @Column isEnabled: boolean;
  @Column spreadsheetId: string;
  @Column spreadsheetRange: string;
}

// const sequelize = require('./sequelize');
// const Sequelize = require('sequelize');

// const Quest = sequelize.define('quest', {
//   name: Sequelize.STRING,
//   startText: Sequelize.STRING,
//   endText: Sequelize.STRING,
//   helpText: Sequelize.STRING,
//   retryText: Sequelize.STRING,
//   disabledText: Sequelize.STRING,
//   errorText: Sequelize.STRING,
//   timeoutText: Sequelize.STRING,
//   isDefault: Sequelize.BOOLEAN,
//   isEnabled: Sequelize.BOOLEAN,
// }, { timestamps: false });

export default Quest;