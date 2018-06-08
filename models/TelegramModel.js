const axios = require('axios');
const _ = require('lodash');
const models = require('./index');
const timings = {};

const wait = time => new Promise(resolve => setTimeout(resolve, time));

module.exports = ({ config }) => {

  const apiRequestUrl = (method) => `https://api.telegram.org/bot${config.botId}/${method}`;

  function getUpdates(lastUpdateId) {
    return axios
      .get(apiRequestUrl('getUpdates'),{
        params: {
          offset: +lastUpdateId + 1
        }
      })
      .then(({ data }) => {
        return data.result || [];
      })
  }

  function keyboardFromOptions(options, one_time_keyboard = true) {
    const keyboard = options.map(({ text }) => [{ text }]);
    return JSON.stringify({ keyboard, one_time_keyboard });
  }
  
  function contactRequestKeyboard(text = 'отправить номер') {
    return JSON.stringify({
      keyboard: [
        [{ text, request_contact: true }]
      ],
      one_time_keyboard: true,
    })
  }

  async function sendMessage(chat_id, text, reply_markup) {
    const { sendInterval } = config;
    const now = Date.now();
    timings[chat_id] = timings[chat_id] || 0;
    const timeFromLastSend = now - timings[chat_id];
    if (timeFromLastSend < sendInterval) {
      await wait(sendInterval - timeFromLastSend)
    }
    timings[chat_id] = now;
    try {
      return axios
        .post(apiRequestUrl('sendMessage'), {
          chat_id,
          text,
          reply_markup
        })
    } catch (e) {
      console.log(e.toString());
    }
  }

  function toUserData({ from }, current_quest_id = 0, current_question_id = 0) {
    const userData = _.pick(from, ['first_name', 'last_name', 'username']);
    userData.user_id = from.id;
    userData.current_quest_id = current_quest_id;
    userData.current_question_id = current_question_id;
    return userData;
  }

  async function findOrCreateUser(data) {
    const { id: telegramId, username } = data;
    const user = await models.User.findOne({
      where: { telegramId },
      include: [{
        association: 'Answers',
        include: ['Question'],
      }, {
        association: 'Question',
        include: ['Quest'],
      }]
    });
    if (user) {
      return user;
    }
    await models.User.create({
      telegramId, username
    });
    return await findOrCreateUser(data);
  }

  return {
    findOrCreateUser,
    getUpdates,
    sendMessage,
    keyboardFromOptions,
    toUserData,
    contactRequestKeyboard
  }
};
