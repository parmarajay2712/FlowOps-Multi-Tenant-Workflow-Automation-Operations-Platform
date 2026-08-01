import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { OrganizationMember, Role } from '../models/OrganizationMember.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  organizationName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
      return;
    }

    const { email, password, name, organizationName } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ email, passwordHash, name });
    await user.save();

    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    const organization = new Organization({
      name: organizationName,
      slug,
      ownerId: user._id,
    });
    await organization.save();

    const membership = new OrganizationMember({
      organizationId: organization._id,
      userId: user._id,
      role: Role.OWNER,
    });
    await membership.save();

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name },
      organization: { id: organization._id, name: organization.name, slug: organization.slug },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const memberships = await OrganizationMember.find({ userId: user._id }).populate('organizationId');
    
    if (memberships.length === 0) {
      res.status(403).json({ success: false, message: 'User does not belong to any organization' });
      return;
    }

    const defaultOrg = memberships[0].organizationId;

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name },
      organization: { id: defaultOrg._id, name: defaultOrg.name, slug: defaultOrg.slug, features: defaultOrg.features },
      memberships: memberships.map(m => ({
        role: m.role,
        organizationId: m.organizationId._id,
        organizationName: m.organizationId.name,
        features: m.organizationId.features || [],
      })),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const memberships = await OrganizationMember.find({ userId: user._id }).populate('organizationId');

    res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
      memberships: memberships.map(m => ({
        role: m.role,
        organizationId: m.organizationId._id,
        organizationName: m.organizationId.name,
        organizationSlug: m.organizationId.slug,
        features: m.organizationId.features || [],
      })),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
