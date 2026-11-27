const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  // Optimized to use a single pass regex with capture group.
  // The replacement function receives the full match (e.g. "_a") and the captured letter ("a").
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
      result[snakeCaseToCamelCase(key)] = (object as Record<string, unknown>)[key];
    }
  }

  return result;
};
