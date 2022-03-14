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

    // listening auditable entities
    db.models().Lists.watch().on('change', this.Handler.bind(this));
    db.models().Items.watch().on('change', this.Handler.bind(this));
  }

  Handler(ev) {
    const { Audit } = db.models();
    const doc = {
      entity: ev.ns.coll,
      operation: ev.operationType,
      opsTs: new Date(ev.clusterTime.getHighBits() * 1000),
      docId: ev.documentKey._id,
    };

    // grabbing document
    if (doc.operation === 'insert') {
      doc.content = JSON.stringify(ev.fullDocument);
    } else if (doc.operation === 'update') {
      doc.content = JSON.stringify(ev.updateDescription);
    }

    Promise
      .resolve(Audit.create(doc))
      .then(() => this.#log.debug(`audited: _id=${doc.docId}; col=${doc.entity}; op=${doc.operation};`))
      .catch((err) => this.#log.error('audit error:', err));
  }

  async Stop() {
    this.#log.debug('Stopping worker...');
    await db.disconnect();
  }
}

module.exports = WorkerApp;
