import mongoose, { Schema } from 'mongoose';

const ApiKeySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true },
    lastUsedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.index({ organizationId: 1 });

export const ApiKey = mongoose.model('ApiKey', ApiKeySchema);
