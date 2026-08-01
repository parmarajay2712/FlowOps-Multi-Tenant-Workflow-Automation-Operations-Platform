import mongoose from 'mongoose';
import { WorkflowExecution, ExecutionStatus } from '../models/WorkflowExecution.js';
import { Workflow } from '../models/Workflow.js';
import { redisClient, isRedisAvailable } from '../config/redis.js';

export const getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    
    // Check Cache
    const cacheKey = `dashboard_stats:${organizationId}`;
    if (isRedisAvailable()) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    // 1. Get workflow success rate and execution trends over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orgObjectId = new mongoose.Types.ObjectId(organizationId);

    const executions = await WorkflowExecution.find({
      organizationId: orgObjectId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === ExecutionStatus.SUCCESS).length;
    const failedExecutions = executions.filter(e => e.status === ExecutionStatus.FAILED).length;
    
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const avgExecutionTime = executions.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) / (totalExecutions || 1);

    // 2. Generate daily execution trend
    const trendMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { date: dateStr, success: 0, failed: 0 };
    }

    executions.forEach(e => {
      const dateStr = new Date(e.createdAt).toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        if (e.status === ExecutionStatus.SUCCESS) trendMap[dateStr].success += 1;
        if (e.status === ExecutionStatus.FAILED) trendMap[dateStr].failed += 1;
      }
    });
    
    const executionTrend = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Most used trigger / action (simplistic approximation for now)
    const activeWorkflows = await Workflow.countDocuments({ organizationId, status: 'ACTIVE' });

    const responseData = {
      totalExecutions,
      successRate: Math.round(successRate * 10) / 10,
      avgExecutionTimeMs: Math.round(avgExecutionTime),
      failedExecutions,
      activeWorkflows,
      executionTrend,
    };

    // Set Cache for 5 minutes
    if (isRedisAvailable()) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
