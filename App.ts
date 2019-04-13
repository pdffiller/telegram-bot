import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const config = require('config');
const { sequelize } = require('./models');
const indexRoute = require('./routes/IndexRoute');
const webHookRoute = require ('./routes/WebHookRoute');
const apiRoute = require('./routes/ApiRoute');

const app = express();
sequelize.sync({ force: false });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRoute);
app.use('/api/message', webHookRoute);
app.use('/api', apiRoute);
app.use('/handleUpdate', webHookRoute);

app.use('/status', (req, res) => {
  res.status(200).send(`OK, ${process.env.BUILD_ID}`);
});

app.get('/config', (req, res) => {
  res.send(JSON.stringify(config));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  // err.status = 404;
  next(err);
});
  
export default app;
