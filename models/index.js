const Answer = require('./Answer');
const Option = require('./Option');
const Quest = require('./Quest');
const Question = require('./Question');
const User = require('./User');
const Text = require('./Text');
const sequelize = require('./sequelize');

Question.hasMany(Option, { as: 'Options' });
Question.hasMany(Question, { as: 'QuestionGroup', foreignKey: 'parentId' });
Question.belongsTo(Quest, { as: 'Quest', foreignKey: 'questId'});

Quest.hasMany(Question, { as: 'Questions' });
Quest.hasMany(Answer, { as: 'Answers' });

Answer.belongsTo(Question, { as: 'Question', foreignKey: 'questionId' });
Answer.belongsTo(Option, { as: 'Option', foreignKey: 'optionId' });

User.belongsTo(Question, { as: 'Question', foreignKey: 'questionId' });
User.hasMany(Answer, { as: 'Answers' });

async function getText(name) {
  const data = await Text.findOne({ where: { name }});
  if (!data) return null;
  return data.text;
}

module.exports =  {
  Answer,
  Option,
  Quest,
  Question,
  User,
  sequelize,
  Text,
  getText,
};
