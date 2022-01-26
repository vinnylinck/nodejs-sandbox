const express = require('express');
const routes = require('./routes');

const app = express();

exports.run = async (port) => {
  app.get('/', routes.Root);

  return app.listen(port);
};

module.exports = exports;
