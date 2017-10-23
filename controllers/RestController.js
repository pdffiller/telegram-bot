module.exports = ({ dbModel }) => {

  async function getQuestResults(quest_id) {
    return dbModel.getQuestResults(quest_id);
  }

  return {
    getQuestResults,
  };
};
