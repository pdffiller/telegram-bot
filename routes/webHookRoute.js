const express = require('express');
const router = express.Router();

module.exports = () => {
  /**
   * Endpoint for WebHook POST request
   */
  router.post('/', function(req, res, next) {
    const { message } = req.body;

    // start handling messages
    if (message) {
      // todo: handle telegram message
    }
  });

  return router;
};
