const Promise = require('bluebird');
const { models } = require('njs-sandbox-commons/db');
const { debugRequest } = require('../logger');
const {
  ValidateListName,
  ValidateListParam,
  ValidateItemParam,
  ValidateItemContent,
  ValidateItemPatch,
  CheckValidationErr,
} = require('./utils');
const { CheckScopes, list: scopes } = require('../security/scope-mw');

exports.Load = [
  CheckScopes(scopes.LIST_READ),

  // render page with lists found in the db
  (req, res) => Promise
    .resolve(models().Lists.find({ owner: req.user.id }))
    .tap((data) => req.log.trace('Lists.find()', data))
    .then((data) => res.render('tools-list-manager', { csrfToken: req.csrfToken(), data }))
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Unexpected error: ${err}`)),
];

exports.Post = [
  CheckScopes(scopes.LIST_WRITE),
  debugRequest,
  ValidateListName,
  CheckValidationErr,

  // here goes the logic for the handler
  (req, res) => Promise
    .resolve(models().Lists.create({ name: req.body.name, owner: req.user.id }))
    .tap((out) => req.log.trace('created list: ', out))
    .then(() => res.redirect(req.get('referer')))
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error saving list: ${err}`)),
];

exports.DeleteList = [
  CheckScopes(scopes.LIST_WRITE),
  debugRequest,
  ValidateListParam,
  CheckValidationErr,

  (req, res) => Promise
    .resolve(models().Lists.findByIdAndDelete(req.params.lid))
    .tap((data) => req.log.trace('Lists.findByIdAndDelete() ', data))
    .then((list) => {
      // no list | no items | empty items array
      if (!list || !list.items || !list.items.length) {
        return null;
      }

      return list.items.map(({ _id }) => _id);
    })
    .tap((ids) => req.log.trace('target items:', ids))
    .then(($in) => models().Items.deleteMany({ _id: { $in } }))
    .then(() => res.status(200).end())
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error deleting list: ${err}`)),
];

exports.EditList = [
  CheckScopes(scopes.LIST_WRITE),
  debugRequest,
  ValidateListParam,
  CheckValidationErr,

  (req, res) => Promise
    .resolve(models().Lists.findById(req.params.lid))
    .tap((out) => req.log.trace('Lists.findById() ', out))
    .then((data) => {
      if (!data) {
        res.status(404).send(`List not found; oid=${req.params.lid}`);
      } else {
        res.render('tools-list-manager-edit', { csrfToken: req.csrfToken(), data });
      }
    })
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Unexpected error: ${err}`)),
];

exports.UpdateList = [
  CheckScopes(scopes.LIST_WRITE),
  debugRequest,
  ValidateListParam,
  CheckValidationErr,

  (req, res) => Promise
    .resolve(models().Lists.updateOne({ _id: req.params.lid }, req.body))
    .tap((out) => req.log.trace('Lists.updateOne() ', out))
    .then((out) => {
      if (out.modifiedCount !== 1) {
        throw new Error(`updated: ${out.modifiedCount}`);
      } else {
        res.status(200).end();
      }
    })
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error updating list: ${err}`)),
];

exports.LoadItems = [
  CheckScopes(scopes.LIST_READ, scopes.ITEM_READ),
  debugRequest,
  ValidateListParam,
  CheckValidationErr,

  // render page with list items
  (req, res) => Promise
    .resolve(models().Lists.findById(req.params.lid).populate('items').exec())
    .tap((out) => req.log.trace('Lists.findById() ', out))
    .then((data) => {
      if (!data) {
        res.status(404).send(`List not found; oid=${req.params.lid}`);
      } else {
        res.render('tools-list-manager-items', { csrfToken: req.csrfToken(), data });
      }
    })
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Unexpected error: ${err}`)),
];

exports.PostItem = [
  CheckScopes(scopes.LIST_WRITE, scopes.ITEM_WRITE),
  debugRequest,
  ValidateListParam,
  ValidateItemContent,
  CheckValidationErr,

  // adding a new item:
  // 1. find list and check if it does exist
  // 2. create item
  // 3. updates list
  (req, res) => Promise
    .resolve(models().Lists.exists({ _id: req.params.lid }))
    .tap((out) => req.log.trace('Lists.exists() ', out))
    .then((found) => {
      if (!found) {
        res.status(404).send(`List not found; oid=${req.params.lid}`);
        return null;
      }

      return req.body.content;
    })
    .then((content) => content && models().Items.create({ content }))
    .then((item) => item && models().Lists.updateOne(
      { _id: req.params.lid },
      { $push: { items: item.id } },
    ))
    .then((result) => {
      if (result.modifiedCount !== 1) {
        throw new Error(`updated: ${result.modifiedCount}`);
      }

      res.redirect(req.get('referer'));
    })
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error saving item: ${err}`)),
];

exports.DeleteItem = [
  CheckScopes(scopes.LIST_WRITE, scopes.ITEM_WRITE),
  ValidateListParam,
  ValidateItemParam,
  CheckValidationErr,

  (req, res) => Promise
    .resolve(models().Lists.updateOne(
      { _id: req.params.lid },
      { $pull: { items: req.params.iid } },
    ))
    .tap((out) => req.log.trace('Lists.updateOne() ', out))
    .then((result) => {
      if (result.modifiedCount !== 1) {
        throw new Error(`updated: ${result.modifiedCount}`);
      }
    })
    .then(() => models().Items.deleteOne({ _id: req.params.iid }))
    .then(() => res.status(200).end())
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error deleting item: ${err}`)),
];

exports.PatchItem = [
  CheckScopes(scopes.ITEM_WRITE),
  debugRequest,
  ValidateListParam,
  ValidateItemParam,
  ValidateItemPatch,
  CheckValidationErr,

  (req, res) => Promise
    .resolve(models().Lists.exists({ _id: req.params.lid }))
    .tap((out) => req.log.trace('Lists.exists() ', out))
    .then((found) => {
      if (!found) {
        res.status(404).send(`List not found; oid=${req.params.lid}`);
        return null;
      }

      return req.body;
    })
    .then((patch) => patch && models().Items.updateOne({ _id: req.params.iid }, patch))
    .then((result) => {
      if (result.modifiedCount !== 1) {
        throw new Error(`updated: ${result.modifiedCount}`);
      }

      res.redirect(req.get('referer'));
    })
    .tapCatch((err) => req.log.error(err))
    .catch((err) => res.status(500).send(`Error updating item: ${err}`)),
];

module.exports = exports;
