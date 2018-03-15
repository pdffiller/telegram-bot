const _ = require('lodash');

module.exports = ({ dbModel }) => {

  async function getQuestResults(quest_id) {
    return dbModel.getQuestResults(quest_id);
  }

  async function addQuestionAnswer(answerData) {
    return dbModel.addQuestionAnswer(_.pick(answerData, ['user_id', 'quest_id', 'question_id', 'option_id', 'text_answer']));
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
    query,
  };
};
