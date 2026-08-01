import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireOrgAccess } from '../middlewares/org.middleware.js';
import { OrganizationMember, Role } from '../models/OrganizationMember.js';

vi.mock('../models/OrganizationMember.js');

describe('Org Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
      user: { id: 'user123' },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
  });

  it('should return 400 if x-organization-id is missing', async () => {
    const middleware = requireOrgAccess();
    await middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'x-organization-id header is required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.headers['x-organization-id'] = 'org123';
    mockReq.user = undefined;

    const middleware = requireOrgAccess();
    await middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not a member of the organization', async () => {
    mockReq.headers['x-organization-id'] = 'org123';
    OrganizationMember.findOne.mockResolvedValueOnce(null);

    const middleware = requireOrgAccess();
    await middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Access denied to this organization' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user has insufficient role (RBAC test)', async () => {
    mockReq.headers['x-organization-id'] = 'org123';
    OrganizationMember.findOne.mockResolvedValueOnce({ role: Role.VIEWER });

    const middleware = requireOrgAccess([Role.ADMIN, Role.OWNER]);
    await middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Insufficient role permissions' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if user has access and sufficient role', async () => {
    mockReq.headers['x-organization-id'] = 'org123';
    OrganizationMember.findOne.mockResolvedValueOnce({ role: Role.ADMIN });

    const middleware = requireOrgAccess([Role.ADMIN, Role.OWNER]);
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.organizationId).toBe('org123');
    expect(mockReq.orgRole).toBe(Role.ADMIN);
  });
});
