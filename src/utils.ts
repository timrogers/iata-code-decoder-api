const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  // Optimized regex replacement using a capture group to avoid inner replaces
  const result = string.replace(/_([a-z])/gi, (_, char) => char.toUpperCase());
  memo.set(string, result);
  return result;
};

/**
 * Optimised version of cameliseKeys that uses Object.keys() and a for-loop
 * to reduce overhead from prototype chain checks and redundant hasOwnProperty calls.
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
