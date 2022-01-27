const config = require('config');
const SandApp = require('./lib/app');
const SandLogger = require('./lib/logger');

const name = config.get('app.name');
const port = config.get('app.port');
const dburl = config.get('db.url');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

// bootstrapping
const app = new SandApp(port, dburl, logger);
const shutdown = () => app.Shutdown()
  .then(() => process.exit(0))
  .catch(() => process.exit(-2));

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// run
logger.info('Starting http server...');

module.exports = app.Run()
  .then(() => logger.info(`Running on port: ${port}`))
  .catch((err) => {
    logger.error(err, 'Something went wrong when trying to run the app!!');
    process.exit(-1);
  });
