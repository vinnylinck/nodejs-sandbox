const config = require('config');
const { logger: SandLogger } = require('njs-sandbox-commons');
const SandApp = require('./lib/app');

const { name, port, templating: tmpOpts } = config.get('app');
const dburl = config.get('db.url');
const secOpts = config.get('security');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

// bootstrapping
logger.info('Starting application...');
const app = new SandApp(logger);
const shutdown = () => app.Shutdown()
  .then(() => process.exit(0))
  .catch(() => process.exit(-2));

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// run
module.exports = app.Run(port, dburl, secOpts, tmpOpts)
  .then(() => logger.info(`Running on port: ${port}`))
  .catch((err) => {
    logger.error(err, 'Something went wrong when trying to run the app!!');
    process.exit(-1);
  });
