const keymirror = require('keymirror');

const COMMAND = {
  START: '/start'
};

const ERROR = keymirror({
  QUEST_NOT_FOUND: null,
  QUEST_DISABLED: null,
  NO_QUESTIONS_IN_QUEST: null,
});

const QUESTION_TYPE = {
  SELECT: 'select',
  TEXT: 'text',
  CONTACT: 'contact',
  NAME: 'name',
  EMAIL: 'email',
  GOTO: 'goto',
  GROUP: 'group',
};

module.exports = () => ({
  COMMAND,
  ERROR,
  QUESTION_TYPE,
});