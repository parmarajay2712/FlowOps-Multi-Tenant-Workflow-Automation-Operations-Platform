import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../controllers/auth.controller.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { OrganizationMember } from '../models/OrganizationMember.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../models/User.js');
vi.mock('../models/Organization.js');
vi.mock('../models/OrganizationMember.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = { body: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('register', () => {
    it('should return 400 for invalid inputs', async () => {
      mockReq.body = { email: 'invalid', password: 'short' };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid inputs',
      }));
    });

    it('should return 409 if email is already in use', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        organizationName: 'Test Org'
      };
      User.findOne.mockResolvedValueOnce({ _id: '123', email: 'test@example.com' });

      await register(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Email already in use' });
    });

    it('should register successfully and return a token', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        organizationName: 'Test Org'
      };
      
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      
      const mockUserSave = vi.fn().mockResolvedValue();
      User.mockImplementation(function() {
        return { _id: 'user123', email: 'test@example.com', name: 'Test User', save: mockUserSave };
      });
      
      const mockOrgSave = vi.fn().mockResolvedValue();
      Organization.mockImplementation(function() {
        return { _id: 'org123', name: 'Test Org', slug: 'test-org', save: mockOrgSave };
      });
      
      const mockMemberSave = vi.fn().mockResolvedValue();
      OrganizationMember.mockImplementation(function() {
        return { save: mockMemberSave };
      });
      
      jwt.sign.mockReturnValueOnce('mockToken');

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'mockToken',
        user: expect.any(Object),
        organization: expect.any(Object),
      }));
    });
  });

  describe('login', () => {
    it('should return 400 for missing credentials', async () => {
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 for wrong email', async () => {
      mockReq.body = { email: 'wrong@example.com', password: 'password123' };
      User.findOne.mockResolvedValueOnce(null);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('should return 401 for wrong password', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      User.findOne.mockResolvedValueOnce({ passwordHash: 'realHash' });
      bcrypt.compare.mockResolvedValueOnce(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
