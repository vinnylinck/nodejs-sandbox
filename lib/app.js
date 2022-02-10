const express = require('express');
const passport = require('passport');
const nunjucks = require('nunjucks');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const MongoStore = require('connect-mongo');
const path = require('path');
const db = require('./db');
const routes = require('./routes');
const GoogleAuth = require('./security/google');

class SandApp {
  #auth;

  #log;

  #expsrv;

  #ensureAuth;

  app;

  constructor(logger) {
    this.#log = logger.child({ service: this.constructor.name });
    this.#auth = null;
    this.#ensureAuth = (req, res, next) => next();
    this.app = null;
  }

  #security(model, mongoUrl, options) {
    this.#log.debug('Passport security configuration...');

    this.#auth = new GoogleAuth(model, options.google, this.#log);
    const sessionOpts = {
      store: MongoStore.create({ mongoUrl }),
      ...options.session,
    };

    const { secret: cookSec, options: cookOpts } = options.cookie;

    this.app.use(cookieParser(cookSec, cookOpts));
    this.app.use(session(sessionOpts));
    this.app.use(csrf());
    this.app.use(passport.authenticate('session'));

    this.#ensureAuth = this.#auth.setup(this.app);
  }

  #templateSetup(options) {
    this.#log.debug('Nunjucks templating setup...');

    const opts = { express: this.app, ...options };
    nunjucks.configure(path.join(__dirname, '../views'), opts);

    this.app.set('view engine', '.njk');
  }

  async Run(port, dbUrl, secOpts, tmpOpts) {
    // db connection / init
    this.#log.debug('Initialize database schema...');
    await db.setup(dbUrl, this.#log);

    // app setup
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // security setup
    if (secOpts) {
      this.#security(db.models().FederatedCredentials, dbUrl, secOpts);
    }

    // templating
    this.#templateSetup(tmpOpts);

    // loading http routes
    this.app.use('/', this.#ensureAuth, express.static('public'));

    // user access tools
    this.app.get('/tools/access', this.#ensureAuth, routes.Load_ToolsAccess);
    this.app.patch('/tools/access/scopes', this.#ensureAuth, routes.Patch_ToolsAccess_Scopes);

    // lists
    this.app.get('/tools/lists', this.#ensureAuth, ...routes.Load_ToolsListMgr);
    this.app.post('/tools/lists', this.#ensureAuth, ...routes.Post_ToolsListMgr);
    this.app.get('/tools/lists/:lid', this.#ensureAuth, ...routes.Edit_ToolsListMgr);
    this.app.put('/tools/lists/:lid', this.#ensureAuth, ...routes.Update_ToolsListMgr);
    this.app.delete('/tools/lists/:lid', this.#ensureAuth, ...routes.Delete_ToolsListMgr);

    // list items
    this.app.get('/tools/lists/:lid/items', this.#ensureAuth, ...routes.Load_ToolsListMgr_Items);
    this.app.post('/tools/lists/:lid/items', this.#ensureAuth, ...routes.Post_ToolsListMgr_Items);
    this.app.delete('/tools/lists/:lid/items/:iid', this.#ensureAuth, ...routes.Delete_ToolsListMgr_Items);
    this.app.patch('/tools/lists/:lid/items/:iid', this.#ensureAuth, ...routes.Patch_ToolsListMgr_Items);

    // event listener
    this.app.get('/tools/events', this.#ensureAuth, ...routes.Load_ToolsEvents);

    // starting
    this.#log.debug(`Listening port ${port}`);
    this.#expsrv = this.app.listen(port);
  }

  async Shutdown() {
    await Promise.fromCallback((cb) => this.#expsrv.close(cb));
    await db.disconnect();
  }
}

module.exports = SandApp;
