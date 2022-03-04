const { key: ref } = require('./items');

const key = 'Lists';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    name: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref }],
  }, { timestamps: true }),
};
