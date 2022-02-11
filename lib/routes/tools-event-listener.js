const { CheckScopes, list: scopes } = require('../security/scopes');
const { models } = require('../db');

exports.Load = [
  CheckScopes(scopes.EVENT_READ),

  (req, res) => res.render(
    'tools-events-listener',
    { csrfToken: req.csrfToken() },
  ),
];

exports.Stream = [
  CheckScopes(scopes.EVENT_READ),

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
