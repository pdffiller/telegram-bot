const express = require('express');
const csv = require('csv');
const _ = require('lodash');
const router = express.Router();

module.exports = ({ restController }) => {
  router.get('/getQuestResults', async (req, res) => {
    const { quest_id, min_correct = 0 } = req.query;

    if (!quest_id) return res.send('no quest_id');

    const questResults = await restController.getQuestResults(quest_id, min_correct);
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

  router.post('/addUserAnswer', async (req, res) => {
    const result = await restController.addQuestionAnswer(req.body);
    res.send(`ok, ${result.insertId}`);
  });

  router.post('/setProgress', async (req, res) => {
    await restController.setProgress(req.body);
    res.send(`ok`);
  });

  router.post('/addQuestion', async (req, res) => {
    try {
      await restController.addQuestion(req.body.question, req.body.options);
      res.send(`ok`);
    } catch (e) {
      res.send(e.toString());
    }
  });

  router.post('/query', async (req, res) => {
    const { sql, values } = req.body;
    
    try {
      const data = await restController.query(sql, values);
      res.send(data);
    } catch (e) {
      res.send(e.toString());
    }
  });

  return router;
};