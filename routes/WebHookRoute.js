const express = require('express');
const router = express.Router();

module.exports = ({ messageHandler }) => {
  /**
   * Endpoint for WebHook POST request
   */
  router.post('/', function(req, res, next) {
    const { message } = req.body;

    // start handling messages
    if (message) {
      res.send('ok');
      return messageHandler.handleUpdate(message)
    }

    res.send('no message');
  });

  return router;
};
