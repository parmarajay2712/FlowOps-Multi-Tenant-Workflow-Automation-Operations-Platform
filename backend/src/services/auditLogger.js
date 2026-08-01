import { AuditLog } from '../models/AuditLog.js';

export const auditLogger = {
  /**
   * Log an action securely. Does not throw to prevent breaking main business logic if logging fails.
   */
  log: async ({ organizationId, actorId, action, resourceType, resourceId, metadata }) => {
    try {
      const logEntry = new AuditLog({
        organizationId,
        actorId,
        action,
        resourceType,
        resourceId,
        metadata
      });
      await logEntry.save();
    } catch (error) {
      console.error('[AuditLogger] Failed to write audit log:', error);
    }
  }
};
