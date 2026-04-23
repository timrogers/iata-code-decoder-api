const cache = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = cache.get(string);
  if (cached) {
    return cached;
  }

  const result = string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );
  cache.set(string, result);
  return result;
};

/**
 * Camelises the keys of an object.
 * Performance: Uses a for...in loop and memoized key transformation to avoid
 * unnecessary array allocations and repeated regex evaluations.
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
