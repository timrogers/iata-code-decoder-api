const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  // Optimized regex with capture group to directly access the letter to uppercase
  const result = string.replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());
  memo.set(string, result);
  return result;
};

/**
 * Optimized version of cameliseKeys that uses Object.keys() and a standard for loop
 * with indexing, which is generally faster than for...in for object property access in V8.
 */
export const cameliseKeys = (object: object): object => {
  const keys = Object.keys(object);
  const result: Record<string, unknown> = {};
  const obj = object as Record<string, unknown>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[snakeCaseToCamelCase(key)] = obj[key];
  }

  return result;
};
