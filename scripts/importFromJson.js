const quest_6 = require('./quest_6');
const _ = require('lodash');
const axios = require('axios');

const quest_id = 6;
const current_question_id = 29;

const url = method => `https://t-bot.pdffillers.com/api/${method}`;

_.forEach(quest_6, async(answers, user_id) => {
  await axios.post(url('setProgress'), {
    user_id,
    current_quest_id: quest_id,
    current_question_id
  });

  await _.forEach(answers, async ({ question_id, text_answer, type }) => {
    if (type !== 'select') {
      await axios.post(url('addUserAnswer'), { user_id, question_id, text_answer, quest_id })
    }

    return;
  });

  console.log(`done ${user_id}`);
});