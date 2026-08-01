import { Router } from 'express';
import { createWorkflow, getWorkflows, getWorkflowById, updateWorkflow, deleteWorkflow, exportWorkflow, importWorkflow, triggerWorkflow } from '../controllers/workflow.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireOrgAccess());

router.post('/', createWorkflow);
router.post('/import', importWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflowById);
router.get('/:id/export', exportWorkflow);
router.post('/:id/trigger', triggerWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

export default router;
