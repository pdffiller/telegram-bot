const express = require('express');
const _ = require('lodash');
const { Quest, Question, Option, Text } = require('../models');


module.exports = ({ restController }) => {
  const router = express.Router();

  router.use((req,res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  });


  /**
   * QUESTS API
   */
  router.get('/quests', async (req, res) => {
    const data = await Quest.findAll();
    res.send(data);
  });

  router.post('/quests', async (req, res) => {
    const data = await Quest.create(req.body);
    res.send(data);
  });

  router.post('/quests/:questId', async (req, res) => {
    const { questId } = req.params;
    const data = await Quest.update(req.body, {
      where: { id: questId }
    });
    res.send(data);
  });


  /**
   * QUEST QUESTIONS API
   */

  router.get('/questions/:questId', async (req, res) => {
    const { questId } = req.params;
    const data = await Question.findAll({
      where: { questId },
      order: [['order', 'ASC']],
    });
    res.send(data);
  });

  router.post('/questions/:questId', async (req, res) => {
    const { questId } = req.params;
    const data = await Question.create(_.set(req.body, 'questId', +questId));
    res.send(data);
  });

  router.post('/questions/:questId/:questionId', async (req, res) => {
    const { questionId, questId } = req.params;
    const data = await Question.update(req.body, {
      where: { id: questionId, questId }
    });
    res.send(data);
  });

  router.delete('/questions/:questId/:questionId', async (req, res) => {
    const { questionId, questId } = req.params;
    const data = await Question.destroy({
      where: { id: questionId, questId }
    });
    await Option.destroy({
      where: { questionId }
    });
    res.send(data);
  });


  /**
   * QUESTION OPTIONS API
   */

  router.get('/options/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const data = await Option.findAll({
      where: { questionId }
    });
    res.send(data);
  });

  router.post('/options/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const data = await Option.create(_.set(req.body, 'questionId', +questionId));
    res.send(data);
  });

  router.post('/options/:questionId/:optionId', async (req, res) => {
    const { optionId, questionId } = req.params;
    const data = await Option.update(req.body, {
      where: { questionId, id: optionId }
    });
    res.send(data);
  });

  router.delete('/options/:questionId/:optionId', async (req, res) => {
    const { optionId, questionId } = req.params;
    const data = await Option.destroy({
      where: { questionId, id: optionId }
    });
    res.send(data);
  });


  /**
   * TEXTS API
   */

  router.get('/texts', async (req, res) => {
    const data = await Text.findAll({});
    res.send(data);
  });

  router.post('/texts', async (req, res) => {
    const data = await Text.create(req.body);
    res.send(data);
  });

  router.post('/texts/:name', async (req, res) => {
    const { name } = req.params;
    const data = await Text.update(req.body, {
      where: { name }
    });
    res.send(data);
  });


  router.options('/*', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
  });

  router.use((req,res) => {
    res.status(404).send({
      message: 'not found',
    })
  });

  return router;
};