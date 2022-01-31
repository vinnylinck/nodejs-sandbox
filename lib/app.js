const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const MongoStore = require('connect-mongo');
const routes = require('./routes');
const schemas = require('./schemas');
const GoogleAuth = require('./security/google');

class SandApp {
  #auth;

  #connstr;

  db;

  #models;

  #log;

  #expsrv;

  app;

  constructor(dburl, logger) {
    this.#connstr = dburl;
    this.#log = logger.child({ service: this.constructor.name });
    this.#auth = null;
    this.#models = {};

    this.app = null;
    this.db = null;
  }

  async #dbsetup() {
    this.#log.trace('Connecting to database...');
    this.db = await mongoose.connect(this.#connstr);
    this.addModel(schemas.List);
    this.addModel(schemas.Item);
  }

  #security(options) {
    this.#log.debug('Passport security configuration...');

    this.#auth = new GoogleAuth(options.google);
    const sessionOpts = {
      store: MongoStore.create({ mongoUrl: this.#connstr }),
      ...options.session,
    };

    this.app.use(cookieParser());
    this.app.use(session(sessionOpts));
    this.app.use(csrf());
    this.app.use(passport.authenticate('session'));

    this.#auth.setup(this.app);
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

  async Run(port, secOpts) {
    // db connection / init
    this.#log.debug('Initialize database schema...');
    this.#dbsetup();

    // app setup
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // security setup
    if (secOpts) {
      this.#security(secOpts);
    }

    // loading http routes
    this.addRoute('/', 'use', express.static('public'));
    this.addRoute('/hello', 'get', routes.Root);

    // starting
    this.#log.debug(`Listening port ${port}`);
    this.#expsrv = this.app.listen(port);
  }

  async Shutdown() {
    await Promise.fromCallback((cb) => this.#expsrv.close(cb));
    await this.db.disconnect();
  }
}

module.exports = SandApp;
