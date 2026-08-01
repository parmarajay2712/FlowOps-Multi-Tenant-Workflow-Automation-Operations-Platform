const resolveField = (data, path) => {
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : undefined;
  }, data);
};

export const evaluateCondition = (condition, data) => {
  const { field, operator, value } = condition;
  const actualValue = resolveField(data, field);

  if (actualValue === undefined) {
    return operator === 'not_equals';
  }

  switch (operator) {
    case 'equals':
      return actualValue === value;
    case 'not_equals':
      return actualValue !== value;
    case 'contains':
      if (typeof actualValue === 'string' || Array.isArray(actualValue)) {
        return actualValue.includes(value);
      }
      return false;
    case 'greater_than':
      return actualValue > value;
    case 'less_than':
      return actualValue < value;
    case 'starts_with':
      if (typeof actualValue === 'string') {
        return actualValue.startsWith(value);
      }
      return false;
    default:
      return false;
  }
};

export const evaluateAllConditions = (conditions, data) => {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(condition => evaluateCondition(condition, data));
};
