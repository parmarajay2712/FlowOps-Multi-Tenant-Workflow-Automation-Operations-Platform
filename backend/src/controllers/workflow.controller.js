import { z } from 'zod';
import { Workflow, WorkflowStatus, TriggerType } from '../models/Workflow.js';
import { WorkflowExecution, ExecutionStatus } from '../models/WorkflowExecution.js';
import { evaluateAllConditions } from '../services/conditionEngine.js';
import { executeAction } from '../services/actionEngine.js';

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(WorkflowStatus).optional(),
  trigger: z.object({
    type: z.nativeEnum(TriggerType),
    config: z.record(z.any()).optional(),
  }),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'starts_with']),
    value: z.any()
  })),
  actions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any()).optional(),
  })),
});

export const createWorkflow = async (req, res) => {
  try {
    const parsed = workflowSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
      return;
    }

    const workflow = new Workflow({
      ...parsed.data,
      organizationId: req.organizationId,
      createdBy: req.user.id,
    });

    await workflow.save();
    
    if (isRedisAvailable()) {
      await redisClient.del(`workflows:${req.organizationId}`);
    }

    res.status(201).json({ success: true, workflow });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

import { redisClient, isRedisAvailable } from '../config/redis.js';

export const getWorkflows = async (req, res) => {
  try {
    const cacheKey = `workflows:${req.organizationId}`;
    if (isRedisAvailable()) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({ success: true, workflows: JSON.parse(cached) });
      }
    }

    const workflows = await Workflow.find({ organizationId: req.organizationId }).sort({ createdAt: -1 });
    
    if (isRedisAvailable()) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(workflows)); // 5 min cache
    }

    res.status(200).json({ success: true, workflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!workflow) {
      res.status(404).json({ success: false, message: 'Workflow not found' });
      return;
    }
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const parsed = workflowSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
      return;
    }

    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { $set: parsed.data },
      { new: true }
    );

    if (!workflow) {
      res.status(404).json({ success: false, message: 'Workflow not found' });
      return;
    }

    if (isRedisAvailable()) {
      await redisClient.del(`workflows:${req.organizationId}`);
    }

    res.status(200).json({ success: true, workflow });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!workflow) {
      res.status(404).json({ success: false, message: 'Workflow not found' });
      return;
    }
    
    if (isRedisAvailable()) {
      await redisClient.del(`workflows:${req.organizationId}`);
    }

    res.status(200).json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const exportWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId }).lean();
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    
    // Clean up internal fields for export
    delete workflow._id;
    delete workflow.__v;
    delete workflow.organizationId;
    delete workflow.createdBy;
    delete workflow.createdAt;
    delete workflow.updatedAt;
    
    // Clean up IDs inside actions and conditions if they look like mongo ObjectIds, or keep them if they are custom IDs
    
    res.status(200).json({ success: true, workflow });
  } catch (error) {
    console.error('Export workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const importWorkflow = async (req, res) => {
  try {
    const parsed = workflowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
    }

    const workflow = new Workflow({
      ...parsed.data,
      organizationId: req.organizationId,
      createdBy: req.user.id,
      name: `${parsed.data.name} (Imported)`, // To distinguish imported workflows
    });

    await workflow.save();
    
    if (isRedisAvailable()) {
      await redisClient.del(`workflows:${req.organizationId}`);
    }

    res.status(201).json({ success: true, workflow });
  } catch (error) {
    console.error('Import workflow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const triggerWorkflow = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};

  try {
    const workflow = await Workflow.findOne({ _id: id, organizationId: req.organizationId });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      return res.status(400).json({ success: false, message: 'Workflow is not active' });
    }

    const execution = new WorkflowExecution({
      organizationId: workflow.organizationId,
      workflowId: workflow._id,
      status: ExecutionStatus.PENDING,
      triggerEventData: { source: 'manual', ...payload },
      startedAt: new Date(),
      steps: [],
      triggeredBy: req.user.id
    });
    await execution.save();

    const conditionsMet = evaluateAllConditions(workflow.conditions, payload);
    
    if (!conditionsMet) {
      execution.status = ExecutionStatus.SUCCESS;
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
      await execution.save();

      return res.status(200).json({ success: true, message: 'Conditions not met, workflow skipped', executionId: execution._id });
    }

    let hasFailedAction = false;
    let finalError = '';

    for (const action of workflow.actions) {
      const stepRecord = {
        actionId: action.id,
        status: ExecutionStatus.PENDING,
        startedAt: new Date(),
        attempts: 1,
        result: null,
        error: '',
        completedAt: undefined
      };
      
      let attempt = 1;
      const MAX_RETRIES = 3;
      let actionSuccess = false;

      while (attempt <= MAX_RETRIES && !actionSuccess) {
        const actionResult = await executeAction(action, payload);
        
        if (actionResult.status === ExecutionStatus.SUCCESS) {
          actionSuccess = true;
          stepRecord.status = ExecutionStatus.SUCCESS;
          stepRecord.result = actionResult.result;
        } else {
          stepRecord.error = actionResult.error || 'Failed';
          stepRecord.attempts = attempt;
          attempt++;
        }
      }

      if (!actionSuccess) {
        stepRecord.status = ExecutionStatus.FAILED;
        hasFailedAction = true;
        finalError = `Action ${action.id} failed after ${MAX_RETRIES} attempts.`;
      }

      stepRecord.completedAt = new Date();
      execution.steps.push(stepRecord);

      if (hasFailedAction) break;
    }

    execution.status = hasFailedAction ? ExecutionStatus.FAILED : ExecutionStatus.SUCCESS;
    if (hasFailedAction) execution.error = finalError;
    execution.completedAt = new Date();
    execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
    
    await execution.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Workflow executed manually', 
      executionId: execution._id,
      status: execution.status
    });

  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during manual trigger' });
  }
};

