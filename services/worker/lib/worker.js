const { db } = require('njs-sandbox-commons');

class WorkerApp {
  #log;

  constructor(logger) {
    this.#log = logger.child({ service: this.constructor.name });
  }

  async Start(dbUrl) {
    // db connection / init
    this.#log.debug('Initialize database schema...');
    await db.setup(dbUrl, this.#log);

    // starting
    this.#log.debug('Listening database changes...');
  }

  async Stop() {
    this.#log.debug('Stopping worker...');
    await db.disconnect();
  }
}

module.exports = WorkerApp;
