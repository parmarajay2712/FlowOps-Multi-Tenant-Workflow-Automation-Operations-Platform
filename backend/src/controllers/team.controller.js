import { z } from 'zod';
import { User } from '../models/User.js';
import { OrganizationMember, Role } from '../models/OrganizationMember.js';
import { auditLogger } from '../services/auditLogger.js';

export const getMembers = async (req, res) => {
  try {
    const members = await OrganizationMember.find({ organizationId: req.organizationId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum([Role.ADMIN, Role.MEMBER, Role.VIEWER]),
});

export const inviteMember = async (req, res) => {
  try {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid inputs', errors: parsed.error.format() });
    }

    const { email, role } = parsed.data;

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'User not found. They must register first.' });
    }

    const existingMembership = await OrganizationMember.findOne({
      organizationId: req.organizationId,
      userId: userToInvite._id,
    });

    if (existingMembership) {
      return res.status(409).json({ success: false, message: 'User is already a member of this organization.' });
    }

    const newMembership = new OrganizationMember({
      organizationId: req.organizationId,
      userId: userToInvite._id,
      role,
    });

    await newMembership.save();

    await auditLogger.log({
      organizationId: req.organizationId,
      actorId: req.user.id,
      action: 'MEMBER_INVITED',
      resourceType: 'MEMBER',
      resourceId: newMembership._id.toString(),
      metadata: { email, role }
    });

    res.status(201).json({ success: true, message: 'Member invited successfully.' });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const membership = await OrganizationMember.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found.' });
    }

    if (membership.role === Role.OWNER) {
      return res.status(403).json({ success: false, message: 'Cannot remove the organization owner.' });
    }

    if (membership.userId.toString() === req.user.id) {
      return res.status(403).json({ success: false, message: 'You cannot remove yourself.' });
    }

    await OrganizationMember.deleteOne({ _id: membership._id });

    await auditLogger.log({
      organizationId: req.organizationId,
      actorId: req.user.id,
      action: 'MEMBER_REMOVED',
      resourceType: 'MEMBER',
      resourceId: membership._id.toString(),
      metadata: { role: membership.role }
    });

    res.status(200).json({ success: true, message: 'Member removed.' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
