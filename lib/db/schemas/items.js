const key = 'Items';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    content: String,
  }, { timestamps: true }),
};
