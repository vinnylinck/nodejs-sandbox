const config = require('config');
const SandApp = require('./lib/app');
const SandLogger = require('./lib/logger');

const name = config.get('app.name');
const port = config.get('app.port');
const dburl = config.get('db.url');
const secOpts = config.get('security');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

// bootstrapping
logger.info('Starting application...');
const app = new SandApp(dburl, logger);
const shutdown = () => app.Shutdown()
  .then(() => process.exit(0))
  .catch(() => process.exit(-2));

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// run
module.exports = app.Run(port, secOpts)
  .then(() => logger.info(`Running on port: ${port}`))
  .catch((err) => {
    logger.error(err, 'Something went wrong when trying to run the app!!');
    process.exit(-1);
  });
