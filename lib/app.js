const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const schemas = require('./schemas');

class SandApp {
  #connstr;

  #netport;

  #expsrv;

  #models;

  #log;

  constructor(port, dburl, logger) {
    // private refs
    this.#connstr = dburl;
    this.#netport = port;
    this.#models = {};
    this.#log = logger.child({ service: this.constructor.name });

    // app obj init
    this.app = express();
    this.db = null;
  }

  addModel(schema) {
    const ref = schema(this.db);

    this.#log.debug(`Initializing model: ${ref.key}`);
    this.#models[ref.key] = mongoose.model(ref.key, ref.data);
  }

  addRoute(path, hook, handler) {
    this.#log.debug(`Adding handler<${hook}> for path: ${path}`);
    this.app[hook](path, handler);
  }

  async Run() {
    // db connection / init
    this.#log.debug('Connecting to databasae...');
    this.db = await mongoose.connect(this.#connstr);
    this.addModel(schemas.List);
    this.addModel(schemas.Item);

    // loading http routes
    this.addRoute('/', 'use', express.static('public'));
    this.addRoute('/hello', 'get', routes.Root);

    // starting
    this.#log.debug(`Listening port ${this.#netport}`);
    this.#expsrv = this.app.listen(this.#netport);
  }

  async Shutdown() {
    await Promise.fromCallback((cb) => this.#expsrv.close(cb));
    await this.db.disconnect();
  }
}

module.exports = SandApp;
