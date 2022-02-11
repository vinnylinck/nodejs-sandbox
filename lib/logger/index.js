const bunyan = require('bunyan');
const uuid = require('uuid');

exports.create = (logLevel, name) => {
  const level = logLevel || 'info';
  const tag = name || 'unknown';

  const logger = bunyan.createLogger({
    name: tag,
    level,
  });

  return logger;
};

exports.logMiddleware = (logger) => (req, res, next) => {
  req.log = logger.child({
    req_id: uuid.v4(),
    secure: req.secure,
    method: req.method,
    uri: req.originalUrl,
  }, false);

  const p = !Object.keys(req.query).length ? '' : `?${req.query}`;

  req.log.debug(`Request: HTTP=${req.httpVersion}; ${req.method.toUpperCase()} ${req.originalUrl}${p}`);
  req.log.trace('Headers:', req.rawHeaders);
  res.on('finish', () => {
    let fn = 'debug';

    if (res.statusCode < 400) {
      fn = 'info';
    } else if (res.statusCode >= 500) {
      fn = 'error';
    } else {
      fn = 'warn';
    }

    req.log[fn](`method=${req.method}; path=${req.originalUrl}; status=${res.statusCode}; message=${res.statusMessage};`);
  });

  next();
};

exports.debugRequest = (req, res, next) => {
  req.log.debug('req.body=', req.body);
  req.log.debug('req.params=', req.params);
  req.log.debug('req.query=', req.query);

  next();
};

exports.errHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  req.log.error(err);
  return res.status(500).send(err);
};

module.exports = exports;
