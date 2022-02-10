const { CheckScopes, list: scopes } = require('../security/scopes');

exports.Load = [
  CheckScopes(scopes.EVENT_READ),

  (req, res) => res.render(
    'tools-events-listener',
    { csrfToken: req.csrfToken() },
  ),
];

module.exports = exports;
