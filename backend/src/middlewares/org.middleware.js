import { OrganizationMember } from '../models/OrganizationMember.js';

export const requireOrgAccess = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.headers['x-organization-id'];

      if (!organizationId) {
        res.status(400).json({ success: false, message: 'x-organization-id header is required' });
        return;
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const membership = await OrganizationMember.findOne({
        organizationId,
        userId: req.user.id,
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Access denied to this organization' });
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(membership.role)) {
          res.status(403).json({ success: false, message: 'Insufficient role permissions' });
          return;
        }
      }

      req.organizationId = organizationId;
      req.orgRole = membership.role;
      next();
    } catch (error) {
      console.error('Org access middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};
