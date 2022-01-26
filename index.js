const config = require('config');
const SandLogger = require('./lib/logger');
const app = require('./lib/app');

const name = config.get('app.name');
const port = config.get('app.port');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

logger.info('Starting http server...');

module.exports = app.run(port)
  .then(() => logger.info(`Running on port: ${port}`))
  .catch((err) => {
    logger.error(err, 'Something went wrong when trying to run the app!!');
    process.exit(-1);
  });
