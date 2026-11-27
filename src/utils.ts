const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  // Optimized regex to directly capture the letter after the underscore
  const result = string.replace(/_([a-z])/gi, (_, letter) => letter.toUpperCase());
  memo.set(string, result);
  return result;
};

/**
 * Optimised version of cameliseKeys that uses a for...in loop and memoization
 * to avoid expensive regex operations and array allocations.
 */
export const cameliseKeys = (object: object): object => {
  const result: Record<string, unknown> = {};

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      // Avoid calling snakeCaseToCamelCase if there's no underscore
      const camelKey = key.includes('_') ? snakeCaseToCamelCase(key) : key;
      result[camelKey] = (object as Record<string, unknown>)[key];
    }
  }

  return result;
};
