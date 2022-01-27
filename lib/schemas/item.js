module.exports = (mongoose) => {
  const key = 'Items';
  const data = new mongoose.Schema({
    content: String,
  });

  return { key, data };
};
