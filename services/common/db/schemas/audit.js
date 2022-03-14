const key = 'Audit';

module.exports = {
  key,
  build: ({ Schema }) => new Schema({
    entity: { type: String, required: true },
    operation: { type: String, required: true },
    opsTs: { type: Date, required: true },
    docId: { type: Schema.Types.ObjectId, required: true },
    content: { type: Buffer },
  }, {
    timestamps: true,
    capped: { size: 51200, max: 1000 },
  }),
};
