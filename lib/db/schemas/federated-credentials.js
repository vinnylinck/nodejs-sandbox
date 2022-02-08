const { list: scopes } = require('../../security/scopes');

module.exports = (mongoose) => {
  const key = 'FederatedCredentials';
  const emailSchema = new mongoose.Schema({ value: String });
  const data = new mongoose.Schema({
    provider: String,
    profileId: String,
    displayName: String,
    profileName: Object,
    emails: [emailSchema],
    naccess: { type: Number, default: 1 },
    scopes: {
      type: [String],
      enum: Object.values(scopes),
      required: true,
      default: [scopes.LIST_READ, scopes.ITEM_READ],
    },
  }, { timestamps: true });

  data.index({ provider: 1, profileId: 1 }, { unique: true });

  return { key, data };
};
