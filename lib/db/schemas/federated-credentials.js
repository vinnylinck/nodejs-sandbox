const { list: scopes } = require('../../security/scopes');

const key = 'FederatedCredentials';

module.exports = {
  key,
  build: ({ Schema }) => {
    const emailSchema = new Schema({ value: String });
    const data = new Schema({
      provider: String,
      profileId: String,
      displayName: String,
      profileName: Object,
      emails: [emailSchema],
      naccess: { type: Number, default: 1 },
      pKey: { type: Buffer, required: true },
      scopes: {
        type: [String],
        enum: Object.values(scopes),
        required: true,
        default: [scopes.LIST_READ, scopes.ITEM_READ],
      },
    }, { timestamps: true });

    data.index({ provider: 1, profileId: 1 }, { unique: true });
    return data;
  },
};
