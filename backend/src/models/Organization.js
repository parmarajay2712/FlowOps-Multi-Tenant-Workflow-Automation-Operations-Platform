import mongoose, { Schema } from 'mongoose';

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    features: {
      type: [String],
      default: ['api_keys', 'audit_logs', 'webhooks'],
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model('Organization', OrganizationSchema);
