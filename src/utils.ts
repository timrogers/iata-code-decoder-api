const memo = new Map<string, string>();

/**
 * Converts a snake_case string to camelCase.
 * Optimized with a more efficient regex and memoization.
 */
const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  const result = string.replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());
  memo.set(string, result);
  return result;
};

/**
 * Optimised version of cameliseKeys that uses Object.keys() and memoization
 * to avoid expensive regex operations and prototype chain lookups.
 */
export const cameliseKeys = (object: object): object => {
  const result: Record<string, unknown> = {};
  const keys = Object.keys(object);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[snakeCaseToCamelCase(key)] = (object as Record<string, unknown>)[key];
  }

  return result;
};
