import axios from 'axios';
import { ExecutionStatus } from '../models/WorkflowExecution.js';

export const executeAction = async (action, context) => {
  try {
    switch (action.type) {
      case 'webhook':
        return await executeWebhookAction(action.config, context);
      case 'send_email':
        return await executeSendEmailAction(action.config, context);
      case 'internal_task':
        return await executeInternalTaskAction(action.config, context);
      case 'delay':
        return await executeDelayAction(action.config, context);
      default:
        return {
          status: ExecutionStatus.FAILED,
          error: `Unknown action type: ${action.type}`
        };
    }
  } catch (error) {
    return {
      status: ExecutionStatus.FAILED,
      error: error.message || 'Action execution failed'
    };
  }
};

const executeWebhookAction = async (config, context) => {
  const { url, method = 'POST', headers = {} } = config;
  
  if (!url) throw new Error('Webhook URL is required');

  const response = await axios({
    method,
    url,
    headers,
    data: context,
    timeout: 5000,
  });

  return {
    status: ExecutionStatus.SUCCESS,
    result: {
      status: response.status,
      data: response.data
    }
  };
};

const executeSendEmailAction = async (config, context) => {
  console.log(`[Action: send_email] Sending to ${config.to} with subject "${config.subject}"`);
  return {
    status: ExecutionStatus.SUCCESS,
    result: { messageId: `mock-email-${Date.now()}` }
  };
};

const executeInternalTaskAction = async (config, context) => {
  console.log(`[Action: internal_task] Created task: ${config.title}`);
  return {
    status: ExecutionStatus.SUCCESS,
    result: { taskId: `task-${Date.now()}` }
  };
};

const executeDelayAction = async (config, context) => {
  const ms = config.ms || 1000;
  console.log(`[Action: delay] Delaying for ${ms}ms...`);
  await new Promise((resolve) => setTimeout(resolve, ms));
  return {
    status: ExecutionStatus.SUCCESS,
    result: { delayedMs: ms }
  };
};
