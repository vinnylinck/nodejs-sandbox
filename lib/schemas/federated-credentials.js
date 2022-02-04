module.exports = (mongoose) => {
  const key = 'FederatedCredentials';
  const data = new mongoose.Schema({
    provider: String,
    profileId: String,
    displayName: String,
    profileName: Object,
    naccess: { type: Number, default: 1 },
  }, { timestamps: true });

  data.index({ provider: 1, profileId: 1 }, { unique: true });

  return { key, data };
};
