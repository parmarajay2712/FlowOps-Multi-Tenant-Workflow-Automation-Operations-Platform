import mongoose from 'mongoose';
import { WorkflowExecution } from '../models/WorkflowExecution.js';

export const getExecutions = async (req, res) => {
  try {
    const executions = await WorkflowExecution.find({ organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('workflowId', 'name');
      
    res.status(200).json({ success: true, executions });
  } catch (error) {
    console.error('Get executions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await WorkflowExecution.deleteMany({ organizationId: req.organizationId });
    res.status(200).json({ success: true, message: 'Execution history cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getExecutionById = async (req, res) => {
  try {
    const execution = await WorkflowExecution.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    }).populate('workflowId', 'name trigger');
    
    if (!execution) {
      res.status(404).json({ success: false, message: 'Execution not found' });
      return;
    }
    res.status(200).json({ success: true, execution });
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const orgObjectId = new mongoose.Types.ObjectId(organizationId);
    const { Workflow } = await import('../models/Workflow.js');
    
    const [totalWorkflows, activeWorkflows, executionsStats] = await Promise.all([
      Workflow.countDocuments({ organizationId: orgObjectId }),
      Workflow.countDocuments({ organizationId: orgObjectId, status: 'ACTIVE' }),
      WorkflowExecution.aggregate([
        { $match: { organizationId: orgObjectId } },
        { 
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    let successful = 0;
    let failed = 0;
    let pending = 0;

    executionsStats.forEach(stat => {
      if (stat._id === 'SUCCESS') successful = stat.count;
      if (stat._id === 'FAILED') failed = stat.count;
      if (stat._id === 'PENDING') pending = stat.count;
    });

    const totalExecutions = successful + failed + pending;
    const successRate = totalExecutions > 0 ? ((successful / totalExecutions) * 100).toFixed(1) : 100;

    res.status(200).json({
      success: true,
      metrics: {
        totalWorkflows,
        activeWorkflows,
        successfulExecutions: successful,
        failedExecutions: failed,
        totalExecutions,
        successRate: parseFloat(successRate)
      }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
