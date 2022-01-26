const config = require('config');
const SandLogger = require('./lib/logger')

const name  = config.get('app.name');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

logger.info(`Starting ${name}...`);
