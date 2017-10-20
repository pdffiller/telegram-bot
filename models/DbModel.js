const mysql = require('mysql');
const _ = require('lodash');

module.exports = ({ config }) => {

  const connection = mysql.createConnection(config.mysql);

  function getQuests() {
    return new Promise((resolve, reject) => {
      connection.query('select * from `quests`', [id], (err, results) => {
        if (err || !results || !results.length){
          reject(err || new Error(`no quest with id ${id}`));
        } else {
          resolve(results.pop());
        }
      });
    });
  }

  function getQuest(id) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `quests` where ' +
        (id !== undefined ? '`id` = ?' : '`is_default` = true');
      connection.query(sql, [id], (err, results) => {
        if (err || !results || !results.length) {
          reject(err || new Error(`no default quest`));
        } else {
          resolve(results.pop());
        }
      });
    });
  }

  function getQuestions(quest_id, question_index) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `quest_questions` where ? order by `order` asc' +
        (question_index === undefined ? '' : ` limit ${question_index}, 1`);
      connection.query(sql, { quest_id }, (err, results) => {
        if (err){
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  function getUserData(user_id) {
    return new Promise((resolve, reject) => {
      const sql = 'select tu.*, qq.type as question_type from `telegram_users` as tu left join quest_questions as qq on tu.current_question_id = qq.id where user_id = ?';
      connection.query(sql, user_id, (err, results) => {
        resolve(results.pop())
      });
    });
  }

  function getUserProgress(user_id) {
    return new Promise((resolve, reject) => {
      const sql = 'select qq.*, qa.option_id, qa.text_answer from quest_questions as qq ' +
        'left join question_answers as qa on qq.id = qa.question_id and qa.user_id = ? ' +
        'where qq.quest_id = (select current_quest_id from telegram_users where user_id = ?) order by qq.order asc';
      connection.query(sql, [user_id, user_id], (err, results) => {
        resolve(results);
      })
    });
  }
  
  function setUserData(info) {
    return new Promise((resolve, reject) => {

      const { user_id } = info;
      const userData  = _.pick(info, ['first_name', 'last_name', 'username', 'current_quest_id', 'current_question_id']);

      connection.query('update `telegram_users` set ? where ?', [userData, { user_id }], (err, res) => {
        resolve(res);
      });
    });
  }

  function addUser(info) {
    return new Promise((resolve, reject) => {
      const userData  = _.pick(info, ['user_id', 'first_name', 'last_name', 'username', 'current_quest_id', 'current_question_id']);

      connection.query('insert into `telegram_users` set ?', userData, (err, res) => {
        resolve(res);
      });
    });
  }
  
  function getQuestionOptions(question_id) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `question_options` where ?';
      connection.query(sql, { question_id }, (err, results) => {
        if (err){
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  function addQuestionAnswer(data) {
    return new Promise((resolve, reject) => {
      const sql = 'insert into `question_answers` set ?';
      const values = _.pick(data, ['user_id', 'quest_id', 'question_id', 'option_id', 'text_answer']);
      connection.query(sql, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.insertId);
        }
      });
    });
  }

  return {
    getQuestionOptions,
    getQuests,
    getQuestions,
    getQuest,
    addQuestionAnswer,
    setUserData,
    getUserData,
    addUser,
    getUserProgress
  };
};