const Promise = require('bluebird');
const { sign, verify, bytesToKeyObject } = require('paseto').V4;
const { models } = require('njs-sandbox-commons/db');
const { CheckScopes, list: scopes } = require('../security/scope-mw');
const { ValidateStreamParams, CheckValidationErr } = require('./utils');

exports.Load = [
  CheckScopes(scopes.EVENT_READ),

  (req, res) => Promise
    .resolve(sign({
      userId: req.user.userId,
      csrfToken: req.csrfToken(),
      scopes: [scopes.LIST_READ, scopes.ITEM_READ],
    }, req.user.pKey))
    .then((fullKey) => fullKey.split('.')[2])
    .then((apiKey) => res.render(
      'tools-events-listener',
      {
        csrfToken: req.csrfToken(),
        apiKey,
      },
    ))
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Unexpected error: ${err}`)),
];

exports.Stream = [
  CheckScopes(scopes.EVENT_READ),
  ...ValidateStreamParams,
  CheckValidationErr,

  // decrypt apikey
  (req, res, next) => Promise
    .resolve(verify(`v4.public.${req.query.apikey}`, bytesToKeyObject(req.user.pKey)))
    .tap((claim) => req.log.trace('claim: ', claim))
    .then((claim) => {
      req.claim = claim;
      next();
    })
    .tapCatch((err) => req.log.error(err))
    .catch(next),

  // check paseto claim
  (req, res, next) => CheckScopes(...req.claim.scopes)(req, res, next),

  // check session
  (req, res, next) => {
    const { _csrf: token } = req.query;

    if (req.claim.csrfToken !== token) {
      return res.status(401).send('token mismatch');
    }
    return next();
  },

  // start data streaming,
  (req, res) => {
    req.log.info(`Streaming data to ${req.user.id}`);
    res.writeHead(200, {
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    });

    // process events
    const hook = (entity) => (ev) => {
      req.log.trace(`streamed event to ${req.user.id}: ${ev}`);
      res.write(`${entity} = ${JSON.stringify(ev, null)}\n\n`);
    };

    // watch models
    models().Lists.watch().on('change', hook('Lists'));
    models().Items.watch().on('change', hook('Items'));

    req.on('close', () => {
      req.log.info(`Stopped streaming data to ${req.user.id}`);
    });
  },
];
module.exports = exports;
