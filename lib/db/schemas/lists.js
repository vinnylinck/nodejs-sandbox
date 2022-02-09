const { key: ref } = require('./items');

const key = 'Lists';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    name: String,
    items: [{ type: Schema.Types.ObjectId, ref }],
  }, { timestamps: true }),
};
