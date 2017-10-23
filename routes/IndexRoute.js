const express = require('express');
const router = express.Router();

module.exports = () => {
  /**
   * Index page
   */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  return router;
};
