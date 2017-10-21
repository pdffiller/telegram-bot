const mysql = require('mysql');
const _ = require('lodash');


module.exports = ({ config }) => {

  const connection = mysql.createConnection(config.mysql);

  const toPromise = (resolve, reject) => (err, res) => !err ? resolve(res) : reject(err);
  const query = (sql, values = []) =>
    new Promise((resolve, reject) =>
      connection.query(sql, values, toPromise(resolve, reject)));

  async function getQuest(id) {
    const sql = 'select * from `quests` where ' +
      (id !== undefined ? '`id` = ?' : '`is_default` = true');

    const quests = await query(sql, [id]);
    return quests.pop();
  }

  function getQuestions(quest_id, question_index) {
    const sql = 'select * from `quest_questions` where ? order by `order` asc' +
      (question_index === undefined ? '' : ` limit ${question_index}, 1`);

    return query(sql, { quest_id} );
  }
  
  async function getUserData(user_id) {
    const sql = 'select tu.*, qq.type as question_type from `telegram_users` as tu ' +
      'left join quest_questions as qq on tu.current_question_id = qq.id where ?';
    const users = await query(sql, { user_id });
    return users.pop();
  }
  
  function setUserData(info) {
    const { user_id } = info;
    const userData  = _.pick(info, ['first_name', 'last_name', 'username', 'current_quest_id', 'current_question_id']);
    return query('update `telegram_users` set ? where ?', [userData, { user_id }]);
  }

  function addUser(info) {
    const userData  = _.pick(info, ['user_id', 'first_name', 'last_name', 'username', 'current_quest_id', 'current_question_id']);
    return query('insert into `telegram_users` set ?', userData);
  }
  
  function getQuestionOptions(question_id) {
    const sql = 'select * from `question_options` where ?';
    return query(sql, { question_id });
  }

  function addQuestionAnswer(data) {
    const sql = 'insert into `question_answers` set ?';
    const values = _.pick(data, ['user_id', 'quest_id', 'question_id', 'option_id', 'text_answer']);
    return query(sql, values);
  }

  function clearUserProgress(user_id) {
    return Promise.all([
      query('delete from telegram_users where ?', { user_id }),
      query('delete from question_answers where ?', { user_id }),
    ]);
  }

  function getQuestProgress(user_id, quest_id) {
    const sql = 'select qq.*, qa.option_id, qa.text_answer from quest_questions as qq ' +
      'left join question_answers as qa on qq.id = qa.question_id and qa.user_id = ? ' +
      'where qq.quest_id = ? order by qq.order asc';
    return query(sql, [user_id, quest_id]);
  }

  return {
    getQuestionOptions,
    getQuestions,
    getQuest,
    addQuestionAnswer,
    setUserData,
    getUserData,
    addUser,
    clearUserProgress,
    getQuestProgress,
  };
};