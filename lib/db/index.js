const mongoose = require('mongoose');
const schemas = require('./schemas');

const models = {};
let db = null;
let log = null;

exports.addModel = (schema) => {
  const ref = schema(db);

  log.debug(`Initializing model: ${ref.key}`);
  models[ref.key] = mongoose.model(ref.key, ref.data);
};

exports.setup = async (uri, logger) => {
  if (!log) {
    log = logger.child({ service: 'db' });
  }

  if (!db) {
    log.trace('Connecting to database...');
    db = await mongoose.connect(uri);
  }

  this.addModel(schemas.Lists);
  this.addModel(schemas.Items);
  this.addModel(schemas.FederatedCredentials);
};

exports.disconnect = () => db.disconnect();
exports.models = () => models;

module.exports = exports;
