import mongoose, { Schema } from 'mongoose';

export const ExecutionStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

const WorkflowExecutionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    status: { type: String, enum: Object.values(ExecutionStatus), default: ExecutionStatus.PENDING },
    triggerEventData: { type: Schema.Types.Mixed }, // Legacy, consider migrating to triggerPayload
    triggerPayload: { type: Schema.Types.Mixed },
    executionPayload: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationMs: { type: Number },
    memoryUsed: { type: Number }, // Estimated bytes
    retryCount: { type: Number, default: 0 },
    steps: [
      {
        actionId: { type: String, required: true },
        status: { type: String, enum: Object.values(ExecutionStatus), required: true },
        startedAt: { type: Date, required: true },
        completedAt: { type: Date },
        result: { type: Schema.Types.Mixed },
        error: { type: String },
        attempts: { type: Number, default: 1 },
      }
    ],
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

WorkflowExecutionSchema.index({ organizationId: 1, workflowId: 1, createdAt: -1 });

export const WorkflowExecution = mongoose.model('WorkflowExecution', WorkflowExecutionSchema);
