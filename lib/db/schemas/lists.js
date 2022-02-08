module.exports = (mongoose) => {
  const key = 'Lists';
  const data = new mongoose.Schema({
    name: String,
  });

  return { key, data };
};
