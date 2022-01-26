const bunyan = require('bunyan');

exports.create = (logLevel, name) => {
  const level = logLevel || 'info';
  const tag = name || 'unknown';

  const logger = bunyan.createLogger({
    name: tag,
    level,
  });

  return logger;
};

module.exports = exports;
