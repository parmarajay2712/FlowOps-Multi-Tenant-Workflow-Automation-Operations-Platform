import { Workflow } from '../models/Workflow.js';
import { WorkflowExecution } from '../models/WorkflowExecution.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { OrganizationMember } from '../models/OrganizationMember.js';

export const globalSearch = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ workflows: [], executions: [], members: [], auditLogs: [] });
    }

    const regex = new RegExp(q, 'i');

    // 1. Search Workflows
    const workflows = await Workflow.find({
      organizationId,
      $or: [{ name: regex }, { description: regex }],
    }).select('name description status _id').limit(5);

    // 2. Search Executions (by ID or error message)
    // Checking if q is a valid ObjectId, otherwise just search by error message
    let executionQuery = { organizationId, error: regex };
    if (q.match(/^[0-9a-fA-F]{24}$/)) {
      executionQuery = { organizationId, _id: q };
    }
    const executions = await WorkflowExecution.find(executionQuery)
      .select('status startedAt _id workflowId')
      .populate('workflowId', 'name')
      .limit(5);

    // 3. Search Members (by user name/email)
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select('_id name email');
    const userIds = users.map(u => u._id);
    
    const members = await OrganizationMember.find({
      organizationId,
      userId: { $in: userIds }
    }).populate('userId', 'name email').limit(5);

    // 4. Search Audit Logs (by action or resourceType)
    const auditLogs = await AuditLog.find({
      organizationId,
      $or: [{ action: regex }, { resourceType: regex }],
    }).populate('actorId', 'name').limit(5);

    res.json({
      workflows: workflows.map(w => ({ id: w._id, type: 'workflow', title: w.name, subtitle: w.description || 'Workflow' })),
      executions: executions.map(e => ({ id: e._id, type: 'execution', title: `Execution ${e._id.toString().slice(-6)}`, subtitle: e.workflowId?.name || 'Workflow' })),
      members: members.map(m => ({ id: m._id, type: 'member', title: m.userId.name, subtitle: m.userId.email })),
      auditLogs: auditLogs.map(a => ({ id: a._id, type: 'auditlog', title: a.action, subtitle: `Resource: ${a.resourceType}` })),
    });
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
