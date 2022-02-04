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

  #ensureAuth;

  app;

  constructor(dburl, logger) {
    this.#connstr = dburl;
    this.#log = logger.child({ service: this.constructor.name });
    this.#auth = null;
    this.#ensureAuth = (req, res, next) => next();
    this.#models = {};

    this.app = null;
    this.db = null;
  }

  async #dbsetup() {
    this.#log.trace('Connecting to database...');
    this.db = await mongoose.connect(this.#connstr);
    this.#addModel(schemas.List);
    this.#addModel(schemas.Item);
    this.#addModel(schemas.FederatedCredentials);
  }

  #addModel(schema) {
    const ref = schema(this.db);

    this.#log.debug(`Initializing model: ${ref.key}`);
    this.#models[ref.key] = mongoose.model(ref.key, ref.data);
  }

  #security(model, options) {
    this.#log.debug('Passport security configuration...');

    this.#auth = new GoogleAuth(model, options.google, this.#log);
    const sessionOpts = {
      store: MongoStore.create({ mongoUrl: this.#connstr }),
      ...options.session,
    };

    const { secret: cookSec, options: cookOpts } = options.cookie;

    this.app.use(cookieParser(cookSec, cookOpts));
    this.app.use(session(sessionOpts));
    this.app.use(csrf());
    this.app.use(passport.authenticate('session'));

    this.#ensureAuth = this.#auth.setup(this.app);
  }

  async Run(port, secOpts) {
    // db connection / init
    this.#log.debug('Initialize database schema...');
    await this.#dbsetup();

    // app setup
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // security setup
    if (secOpts) {
      this.#security(this.#models.FederatedCredentials, secOpts);
    }

    // loading http routes
    this.app.use('/', this.#ensureAuth, express.static('public'));
    this.app.get('/hello', this.#ensureAuth, routes.Root);

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
