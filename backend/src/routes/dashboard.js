import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireOrgAccess());

router.get('/stats', getDashboardStats);

export default router;
