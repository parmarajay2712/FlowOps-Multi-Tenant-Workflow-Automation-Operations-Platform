import mongoose, { Schema } from 'mongoose';

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

const OrganizationMemberSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.MEMBER,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can only have one membership per organization
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
// Fast lookup of all orgs for a user
OrganizationMemberSchema.index({ userId: 1 });

export const OrganizationMember = mongoose.model('OrganizationMember', OrganizationMemberSchema);
