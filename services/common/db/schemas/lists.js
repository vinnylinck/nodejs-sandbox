const { key: itemRef } = require('./items');
const { key: fcRef } = require('./federated-credentials');

const key = 'Lists';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    name: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: itemRef }],
    owner: { type: Schema.Types.ObjectId, ref: fcRef },
  }, { timestamps: true }),
};
