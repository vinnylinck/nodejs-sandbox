const bunyan = require('bunyan');

exports.create = (logLevel, name) => {
  level = logLevel || 'info';
  tag = name || 'unknown';

  const logger = bunyan.createLogger({
    name: tag,
    level
   });

  return logger
};

module.exports = exports
