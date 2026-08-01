import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';
import { Role } from '../models/OrganizationMember.js';

const router = Router();

router.use(requireAuth);
// Only ADMIN and OWNER can view audit logs
router.use(requireOrgAccess([Role.ADMIN, Role.OWNER]));

router.get('/', getAuditLogs);

export default router;
