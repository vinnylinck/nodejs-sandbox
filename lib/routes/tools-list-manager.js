const Promise = require('bluebird');
const { ValidateListName, CheckValidationErr } = require('./utils');
const { models } = require('../db');
const { CheckScopes, list: scopes } = require('../security/scopes');

exports.Load = [
  CheckScopes(scopes.LIST_READ, scopes.ITEM_READ),

  // render page with lists found in the db
  (req, res) => Promise
    .resolve(models().Lists.find({}))
    .then((data) => res.render('tools-list-manager', { csrfToken: req.csrfToken(), data }))
    .catch((err) => res.status(500).send(`Unexpected error: ${err}`)),
];

exports.Post = [
  CheckScopes(scopes.LIST_WRITE),
  ValidateListName,
  CheckValidationErr,

  // here goes the logic for the handler
  (req, res) => Promise
    .resolve(models().Lists.create({ name: req.body.name }))
    .then(() => res.redirect(req.get('referer')))
    .catch((err) => res.status(500).send(`Error saving list: ${err}`)),
];

module.exports = exports;
