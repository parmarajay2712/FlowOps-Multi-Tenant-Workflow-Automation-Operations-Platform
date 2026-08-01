import { Router } from 'express';
import { getMembers, inviteMember, removeMember } from '../controllers/team.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';
import { Role } from '../models/OrganizationMember.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireOrgAccess(), getMembers);
router.post('/invite', requireOrgAccess([Role.ADMIN, Role.OWNER]), inviteMember);
router.delete('/:id', requireOrgAccess([Role.ADMIN, Role.OWNER]), removeMember);

export default router;
