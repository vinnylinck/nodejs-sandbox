const key = 'Items';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    content: { type: String, required: true },
    ok: { type: Boolean, default: false },
  }, { timestamps: true }),
};
