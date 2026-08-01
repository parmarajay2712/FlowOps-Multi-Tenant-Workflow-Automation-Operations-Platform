import { Router } from 'express';
import { createApiKey, getApiKeys, revokeApiKey } from '../controllers/apikey.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';
import { Role } from '../models/OrganizationMember.js';

const router = Router();

router.use(requireAuth);
// Only ADMIN and OWNER can manage API keys
router.use(requireOrgAccess([Role.ADMIN, Role.OWNER]));

router.post('/', createApiKey);
router.get('/', getApiKeys);
router.delete('/:id', revokeApiKey);

export default router;
