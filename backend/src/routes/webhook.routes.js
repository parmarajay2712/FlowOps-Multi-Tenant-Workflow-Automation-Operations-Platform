import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many webhook requests, please slow down.' }
});

router.post('/:workflowId', webhookLimiter, handleWebhook);

export default router;
