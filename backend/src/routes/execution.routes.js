import { Router } from 'express';
import { getExecutions, getExecutionById, getDashboardMetrics, clearHistory } from '../controllers/execution.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireOrgAccess());

router.get('/metrics', getDashboardMetrics);
router.get('/', getExecutions);
router.delete('/', clearHistory);
router.get('/:id', getExecutionById);

export default router;
