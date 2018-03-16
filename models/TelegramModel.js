const axios = require('axios');
const _ = require('lodash');

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

  function sendMessage(chat_id, text, reply_markup) {
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

  return {
    getUpdates,
    sendMessage,
    keyboardFromOptions,
    toUserData,
    contactRequestKeyboard
  }
};
