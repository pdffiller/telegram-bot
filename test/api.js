const axios = require('axios');

module.exports = axios.create({
  baseURL: `http://localhost:${process.env.PORT || '3001'}/api/`
});