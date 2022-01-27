const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const schemas = require('./schemas');

class SandApp {
  #connstr;

  #netport;

  #expsrv;

  #models;

  constructor(port, dburl) {
    // private refs
    this.#connstr = dburl;
    this.#netport = port;

    // app obj init
    this.app = express();
    this.db = null;
    this.#models = {};
  }

  addModel(schema) {
    const ref = schema(this.db);
    this.#models[ref.key] = mongoose.model(ref.key, ref.data);
  }

  async Run() {
    // db connection / init
    this.db = await mongoose.connect(this.#connstr);
    this.addModel(schemas.List);
    this.addModel(schemas.Item);

    // loading http routes
    this.app.use('/', express.static('public'));
    this.app.get('/hello', routes.Root);

    // starting
    this.#expsrv = this.app.listen(this.#netport);
  }
}

module.exports = SandApp;
