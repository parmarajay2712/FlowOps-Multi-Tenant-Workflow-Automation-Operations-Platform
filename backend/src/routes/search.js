import express from 'express';
import { globalSearch } from '../controllers/search.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireOrgAccess());
router.get('/', globalSearch);

export default router;
