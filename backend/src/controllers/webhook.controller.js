import { redisClient, isRedisAvailable } from '../config/redis.js';
import { Workflow, WorkflowStatus, TriggerType } from '../models/Workflow.js';
import { WorkflowExecution, ExecutionStatus } from '../models/WorkflowExecution.js';
import { evaluateAllConditions } from '../services/conditionEngine.js';
import { executeAction } from '../services/actionEngine.js';

export const handleWebhook = async (req, res) => {
  const { workflowId } = req.params;
  const payload = req.body;
  
  const idempotencyKey = req.headers['x-idempotency-key'];

  try {
    if (idempotencyKey && isRedisAvailable()) {
      const redisKey = `idempotency:${workflowId}:${idempotencyKey}`;
      const existingResult = await redisClient.get(redisKey);
      
      if (existingResult) {
        res.status(200).json({
          success: true,
          message: 'Already processed',
          data: JSON.parse(existingResult)
        });
        return;
      }
      await redisClient.setEx(redisKey, 86400, JSON.stringify({ status: 'PROCESSING' }));
    }

    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) {
      res.status(404).json({ success: false, message: 'Workflow not found' });
      return;
    }

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      res.status(400).json({ success: false, message: 'Workflow is not active' });
      return;
    }

    if (workflow.trigger.type !== TriggerType.WEBHOOK) {
      res.status(400).json({ success: false, message: 'Workflow trigger is not webhook' });
      return;
    }

    const execution = new WorkflowExecution({
      organizationId: workflow.organizationId,
      workflowId: workflow._id,
      status: ExecutionStatus.PENDING,
      triggerEventData: payload,
      startedAt: new Date(),
      steps: []
    });
    await execution.save();

    const conditionsMet = evaluateAllConditions(workflow.conditions, payload);
    
    if (!conditionsMet) {
      execution.status = ExecutionStatus.SUCCESS;
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
      await execution.save();

      res.status(200).json({ success: true, message: 'Conditions not met, workflow skipped', executionId: execution._id });
      return;
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

    if (idempotencyKey && isRedisAvailable()) {
      const redisKey = `idempotency:${workflowId}:${idempotencyKey}`;
      await redisClient.setEx(redisKey, 86400, JSON.stringify({ 
        status: execution.status, 
        executionId: execution._id 
      }));
    }

    res.status(200).json({ 
      success: true, 
      message: 'Workflow executed', 
      executionId: execution._id,
      status: execution.status
    });

  } catch (error) {
    console.error('Webhook execution error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during webhook processing' });
  }
};
