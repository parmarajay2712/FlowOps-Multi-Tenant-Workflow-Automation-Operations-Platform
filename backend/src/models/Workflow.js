import mongoose, { Schema } from 'mongoose';

export const WorkflowStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  INACTIVE: 'INACTIVE',
};

export const TriggerType = {
  WEBHOOK: 'WEBHOOK',
  MANUAL: 'MANUAL',
  APP_EVENT: 'APP_EVENT',
};

const WorkflowSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: Object.values(WorkflowStatus), default: WorkflowStatus.ACTIVE },
    trigger: {
      type: { type: String, enum: Object.values(TriggerType), required: true },
      config: { type: Schema.Types.Mixed },
    },
    conditions: [
      {
        field: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
      }
    ],
    actions: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        config: { type: Schema.Types.Mixed },
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

WorkflowSchema.index({ organizationId: 1, status: 1 });

export const Workflow = mongoose.model('Workflow', WorkflowSchema);
