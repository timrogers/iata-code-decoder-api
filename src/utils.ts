const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  // Optimized regex to capture only the character following the underscore
  const result = string.replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());
  memo.set(string, result);
  return result;
};

/**
 * Optimised version of cameliseKeys that uses Object.keys() and a standard for loop
 * to avoid the overhead of walking the prototype chain with for...in.
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
