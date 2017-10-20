const _ = require('lodash');

let timeoutId;
let lastUpdateid = 0;

module.exports = ({ config, telegramModel, messageHandler }) => {

  async function getMessages() {
    const updates = await telegramModel.getUpdates(lastUpdateid);
    await Promise.all(updates.map(handleUpdate));
    timeoutId = false;
    run();
  }

  function handleUpdate({ update_id, message }) {
    lastUpdateid = update_id;
    return messageHandler.handleUpdate(message)
  }

  function run() {
    if (!timeoutId) {
      timeoutId = setTimeout(getMessages, config.getUpdates.interval);
    }
  }

  function stop() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  return {
    run,
    stop
  }
};