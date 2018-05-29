const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

module.exports = ({ config, indexRoute, webHookRoute, apiRoute}) => {
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
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRoute);
  app.use('/api', apiRoute);
  app.use('/handleUpdate', webHookRoute);
  app.use('/api/message', webHookRoute);

  app.use('/status', (req, res) => {
    res.status(200).send(`OK, ${process.env.BUILD_ID}`);
  });

  app.get('/config', (req, res) => {
    res.send(JSON.stringify(config));
  });

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
};
