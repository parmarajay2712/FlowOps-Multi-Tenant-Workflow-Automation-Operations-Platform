import { describe, it, expect } from 'vitest';
import { evaluateCondition, evaluateAllConditions } from './conditionEngine.js';

describe('Condition Engine', () => {
  const mockPayload = {
    user: {
      id: '123',
      role: 'admin',
      tags: ['premium', 'beta']
    },
    amount: 1050,
    status: 'completed'
  };

  describe('evaluateCondition', () => {
    it('should correctly evaluate "equals" operator', () => {
      const condition = { field: 'user.role', operator: 'equals', value: 'admin' };
      expect(evaluateCondition(condition, mockPayload)).toBe(true);

      const falseCondition = { field: 'status', operator: 'equals', value: 'pending' };
      expect(evaluateCondition(falseCondition, mockPayload)).toBe(false);
    });

    it('should correctly evaluate "not_equals" operator', () => {
      const condition = { field: 'user.role', operator: 'not_equals', value: 'user' };
      expect(evaluateCondition(condition, mockPayload)).toBe(true);
    });

    it('should correctly evaluate "contains" operator for arrays', () => {
      const condition = { field: 'user.tags', operator: 'contains', value: 'premium' };
      expect(evaluateCondition(condition, mockPayload)).toBe(true);
    });

    it('should correctly evaluate "contains" operator for strings', () => {
      const condition = { field: 'status', operator: 'contains', value: 'plete' };
      expect(evaluateCondition(condition, mockPayload)).toBe(true);
    });

    it('should correctly evaluate "greater_than" and "less_than" operators', () => {
      expect(evaluateCondition({ field: 'amount', operator: 'greater_than', value: 1000 }, mockPayload)).toBe(true);
      expect(evaluateCondition({ field: 'amount', operator: 'less_than', value: 2000 }, mockPayload)).toBe(true);
      expect(evaluateCondition({ field: 'amount', operator: 'greater_than', value: 2000 }, mockPayload)).toBe(false);
    });

    it('should handle undefined paths safely', () => {
      const condition = { field: 'user.missingField', operator: 'equals', value: 'something' };
      expect(evaluateCondition(condition, mockPayload)).toBe(false);

      const notEqualsCondition = { field: 'user.missingField', operator: 'not_equals', value: 'something' };
      // undefined !== 'something' is true
      expect(evaluateCondition(notEqualsCondition, mockPayload)).toBe(true);
    });
  });

  describe('evaluateAllConditions', () => {
    it('should return true if no conditions are provided', () => {
      expect(evaluateAllConditions([], mockPayload)).toBe(true);
      expect(evaluateAllConditions(null, mockPayload)).toBe(true);
    });

    it('should return true only if all conditions pass (AND logic)', () => {
      const conditions = [
        { field: 'user.role', operator: 'equals', value: 'admin' },
        { field: 'amount', operator: 'greater_than', value: 1000 }
      ];
      expect(evaluateAllConditions(conditions, mockPayload)).toBe(true);

      const failingConditions = [
        { field: 'user.role', operator: 'equals', value: 'admin' },
        { field: 'amount', operator: 'greater_than', value: 5000 }
      ];
      expect(evaluateAllConditions(failingConditions, mockPayload)).toBe(false);
    });
  });
});
