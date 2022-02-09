const mongoose = require('mongoose');
const schemas = require('./schemas');

const models = {};
let db = null;
let log = null;

exports.addModel = ({ key, build }) => {
  log.debug(`Initializing model: ${key}`);
  models[key] = mongoose.model(key, build(db));
};

exports.setup = async (uri, logger) => {
  if (!log) {
    log = logger.child({ service: 'db' });
  }

  if (!db) {
    log.trace('Connecting to database...');
    db = await mongoose.connect(uri);
  }

  this.addModel(schemas.Items);
  this.addModel(schemas.Lists);
  this.addModel(schemas.FederatedCredentials);
};

exports.disconnect = () => db.disconnect();
exports.models = () => models;

module.exports = exports;
