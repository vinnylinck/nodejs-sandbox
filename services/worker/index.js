const config = require('config');
const { logger: SandLogger } = require('njs-sandbox-commons');
const SandWorker = require('./lib/worker');

const { name } = config.get('app');
const dburl = config.get('db.url');

const logger = SandLogger.create(
  config.get('app.logging.level'),
  name,
);

// bootstrapping
logger.info('Starting application...');
const wrk = new SandWorker(logger);
const shutdown = () => wrk.Stop()
  .then(() => process.exit(0))
  .catch(() => process.exit(-2));

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// run
module.exports = wrk.Start(dburl)
  .then(() => logger.info('Worker has started successfully...'))
  .catch((err) => {
    logger.error(err, 'Something went wrong when trying to run the worker!!');
    process.exit(-1);
  });
