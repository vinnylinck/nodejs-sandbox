const Promise = require('bluebird');
const { models, collection } = require('../db');
const { list: scopes } = require('../security/scopes');

exports.Load = ({ csrfToken, user }, res) => Promise
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

    return {
      csrfToken: csrfToken(),
      hasProps,
      data,
      naccess,
      nsessions,
      scopeMap,
    };
  })
  .then((data) => res.render('tools-access-manager', data));

exports.PatchScope = ({ user, body }, res) => {
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

  return Promise
    .resolve(models().FederatedCredentials.updateOne({ _id: user.id }, patch))
    .then((out) => {
      if (out.modifiedCount !== 1) {
        throw new Error(`updated: ${out.modifiedCount}`);
      } else {
        res.status(200).end();
      }
    })
    .catch((err) => res.status(500).send(`Error updating scope: ${err}`));
};

module.exports = exports;
