import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireOrgAccess } from '../middlewares/org.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireOrgAccess());
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
