const Promise = require('bluebird');
const { models, collection } = require('../db');
const { list: scopes } = require('../security/scopes');

exports.Load = ({ csrfToken, log, user }, res) => Promise
  .resolve(collection('sessions'))
  .then((raw) => raw.find({}))
  .then((cursor) => cursor.toArray())
  .then((all) => all
    .map(({ session }) => session)
    .map((s) => JSON.parse(s))
    .filter((j) => j.passport.user.id === user.id))
  .then((f) => f.length)
  .then((nsessions) => {
    const {
      id: uuid,
      provider,
      displayName,
      profileName,
      emails,
      naccess,
      scopes: allowed,
      createdAt,
      updatedAt,
    } = user;

    const data = {
      uuid,
      provider,
      displayName,
      profileName: JSON.stringify(profileName),
      emails: emails.map(({ value }) => value),
      createdAt,
      updatedAt,
    };

    const hasProps = data && Object.keys(data).length > 0;

    const scopeMap = Object
      .entries(scopes)
      .map(([name, value]) => ({
        name,
        checked: allowed.includes(value),
      }));

    const result = {
      csrfToken: csrfToken(),
      hasProps,
      data,
      naccess,
      nsessions,
      scopeMap,
    };

    log.trace('result: ', result);
    return result;
  })
  .then((data) => res.render('tools-access-manager', data))
  .tapCatch((err) => log.error(err))
  .catch((err) => res.status(500).send(`Error loading user data: ${err}`));

exports.DeleteSessions = ({ session, log }, res) => Promise
  .resolve(collection('sessions'))
  .then((raw) => raw.find({}))
  .then((cursor) => cursor.toArray())
  .then((all) => all
    .map(({ _id: id, session: s }) => ({ id, dat: JSON.parse(s) }))
    .filter(({ dat }) => (
      dat.passport.user.id === session.passport.user.id
      && dat.csrfSecret !== session.csrfSecret))
    .map(({ id }) => id))
  .tap((sids) => log.debug('deleting sessions: ', sids))
  .then(($in) => collection('sessions').deleteMany({ _id: { $in } }))
  .tap((out) => log.trace('sessions.deleteMany()', out))
  .then(() => res.status(200).end())
  .tapCatch((err) => log.error(err))
  .catch((err) => res.status(500).send(`Error deleting user sessions: ${err}`));

exports.DeleteData = ({ session, log }, res) => Promise
  .resolve(collection('sessions'))
  .then((raw) => raw.find({}))
  .then((cursor) => cursor.toArray())
  .then((all) => all
    .map(({ _id: id, session: s }) => ({ id, dat: JSON.parse(s) }))
    .filter(({ dat }) => (dat.passport.user.id === session.passport.user.id))
    .map(({ id }) => id))
  .tap((sids) => log.debug('deleting sessions: ', sids))
  .then(($in) => collection('sessions').deleteMany({ _id: { $in } }))
  .tap((out) => log.trace('sessions.deleteMany()', out))
  .then(() => models().FederatedCredentials.deleteOne({ _id: session.passport.user.id }))
  .tap((out) => log.trace('FederatedCredentials.deleteOne()', out))
  .then(() => res.status(200).end())
  .tapCatch((err) => log.error(err))
  .catch((err) => res.status(500).send(`Error deleting user data: ${err}`));

exports.PatchScope = ({ user, body, log }, res) => {
  const entries = Object.keys(body);
  const patch = { $set: { scopes: [] } };

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(scopes)) {
    // if requesting to add OR
    // not requesting but user has already
    if (body[key] || (!entries.includes(key) && user.scopes.includes(value))) {
      patch.$set.scopes.push(value);
    }
  }

  log.debug('updating user scopes: ', patch);
  return Promise
    .resolve(models().FederatedCredentials.updateOne({ _id: user.id }, patch))
    .tap((out) => log.trace('FederatedCredentials.updateOne() ', out))
    .then((out) => {
      if (out.modifiedCount !== 1) {
        throw new Error(`updated: ${out.modifiedCount}`);
      } else {
        res.status(200).end();
      }
    })
    .tapCatch((err) => log.error(err))
    .catch((err) => res.status(500).send(`Error updating scope: ${err}`));
};

module.exports = exports;
