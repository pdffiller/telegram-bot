const fs = require('fs');
const csv = require('csv');
const _ = require('lodash');

const { users } = require('./data');

const toRow = o => [o.name, o.email, o.contact, o.text, o.correct];

csv.stringify(_.sortBy(users, 'correct').reverse().map(toRow), (err, csvData) => {
  fs.writeFileSync('output.csv', csvData || err.toString());
});

