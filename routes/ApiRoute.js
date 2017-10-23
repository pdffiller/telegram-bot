const express = require('express');
const csv = require('csv');
const _ = require('lodash');
const router = express.Router();

module.exports = ({ restController }) => {
  router.get('/getQuestResults', async (req, res) => {
    const { quest_id } = req.query;

    if (!quest_id) return res.send('no quest_id');

    const questResults = await restController.getQuestResults(quest_id);
    res.send(questResults);
  });

  router.get('/exportQuestResults', async (req, res) => {
    const { quest_id } = req.query;

    if (!quest_id) return res.send('no quest_id');

    const questResults = await restController.getQuestResults(quest_id);
    const csvResults = _.map(questResults, (results, user_id) => _.map(results, answer => {
      return answer.type === 'text' ? answer.text_answer : (answer.is_correct ? 'correct' : 'wrong');
    }));

    res.set({"Content-Disposition":"attachment; filename=\"data.csv\""});
    csv.stringify(csvResults, (err, data) => res.send(data));
  });

  return router;
};