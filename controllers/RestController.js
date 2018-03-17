const _ = require('lodash');

module.exports = ({ dbModel }) => {

  async function getQuestResults(quest_id, min_correct = 0) {
    const data = await dbModel.getQuestResults(quest_id);

    const users = _.map(data, answers => {
      const user = {
        correct: 0,
      };

      answers.forEach(a => {
        if (a.type === 'select') {
          user.correct += a.is_correct;
        } else {
          user[a.type] = a.text_answer || a.option_text;
        }
      });

      return user;
    }).filter(u => u.correct >= +min_correct).map((item, index) => {
      item.index = index;
      return item;
    });

    return {
      total: users.length,
      users,
    }
  }

  async function addQuestionAnswer(answerData) {
    return dbModel.addQuestionAnswer(_.pick(answerData, ['user_id', 'quest_id', 'question_id', 'option_id', 'text_answer']));
  }

  async function addQuestion(question, options = []) {
    return dbModel.addQuestion(question, options);
  }

  async function setProgress({ user_id, current_quest_id, current_question_id }) {
    return dbModel.setUserData({ user_id, current_quest_id, current_question_id });
  }
  
  async function query(sql, values = []) {
    return dbModel.query(sql, values);
  }

  return {
    getQuestResults,
    addQuestionAnswer,
    setProgress,
    addQuestion,
    query,
  };
};
