const memo = new Map<string, string>();

/**
 * Converts a snake_case string to camelCase, with memoization for performance.
 * Uses an optimized regex with a direct capture group replacement.
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
 * Optimised version of cameliseKeys that uses Object.keys() and a standard for loop
 * with indexing to avoid prototype chain lookups and maximize V8 engine optimization.
 */
export const cameliseKeys = (object: object): object => {
  const keys = Object.keys(object);
  const result: Record<string, unknown> = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[snakeCaseToCamelCase(key)] = (object as Record<string, unknown>)[key];
  }

  return result;
};
