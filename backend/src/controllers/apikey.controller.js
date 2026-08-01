import crypto from 'crypto';
import { z } from 'zod';
import { ApiKey } from '../models/ApiKey.js';
import { auditLogger } from '../services/auditLogger.js';

const createKeySchema = z.object({
  name: z.string().min(2).max(50),
});

export const createApiKey = async (req, res) => {
  try {
    const parsed = createKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
    }

    // Generate a secure API key
    const rawKey = 'fo_' + crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = new ApiKey({
      organizationId: req.organizationId,
      name: parsed.data.name,
      keyHash,
      createdBy: req.user.id,
    });

    await apiKey.save();

    await auditLogger.log({
      organizationId: req.organizationId,
      actorId: req.user.id,
      action: 'API_KEY_CREATED',
      resourceType: 'API_KEY',
      resourceId: apiKey._id.toString(),
      metadata: { name: apiKey.name }
    });

    res.status(201).json({
      success: true,
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        key: rawKey // Only returned once!
      }
    });
  } catch (error) {
    console.error('Create API Key error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ organizationId: req.organizationId })
      .select('-keyHash')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, apiKeys: keys });
  } catch (error) {
    console.error('Get API Keys error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    await auditLogger.log({
      organizationId: req.organizationId,
      actorId: req.user.id,
      action: 'API_KEY_REVOKED',
      resourceType: 'API_KEY',
      resourceId: apiKey._id.toString(),
      metadata: { name: apiKey.name }
    });

    res.status(200).json({ success: true, message: 'API Key revoked' });
  } catch (error) {
    console.error('Revoke API Key error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
