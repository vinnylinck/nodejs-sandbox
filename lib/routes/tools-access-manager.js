const Promise = require('bluebird');
const { models } = require('../db');
const { list: scopes } = require('../security/scopes');

exports.Load = ({ csrfToken, user }, res) => {
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

  return res.render(
    'tools-access-manager',
    {
      csrfToken: csrfToken(),
      hasProps,
      data,
      naccess,
      scopeMap,
    },
  );
};

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
