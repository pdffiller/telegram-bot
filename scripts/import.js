const csv = require('csv');
const fs = require('fs');
const mysql = require('mysql');
const config = require('config');
const async = require('async');

const data = fs.readFileSync(__dirname + '/data/questions.csv', 'utf8');

const connection = mysql.createConnection(config.mysql);

function isValid(row) {
  return row.every(item => item && item.length);
}

csv.parse(data, (err, rows) => {
  rows.shift();

  connection.query('insert into quests set ?', {
    name: Date.now(),
    start_text: '',
    end_text: '',
    max_questions: 6,
    is_default: true
  }, (err, results) => {
    let questionIndex = 1;
    async.eachSeries(rows, (row, next) => {
      if (isValid(row)) {
        const [ id, question_text, op1, op2, op3, op4, correctOp ] = row;

        connection.query('insert into quest_questions set ?', {
          quest_id: results.insertId,
          order: questionIndex++,
          question_text,
          type: 'select',
          is_required: false,
        }, (err, results) => {
          let optionIndex = 1;

          async.eachSeries([op1, op2, op3, op4], (option, done) => {
            connection.query('insert into question_options set ?', {
              question_id: results.insertId,
              text: option,
              is_correct: optionIndex++ === +correctOp,
            }, (err, results) => {
              console.log(err, results);
              done(err)
            })
          }, next)
        })
      } else next();
    })
  })
});