const memo = new Map<string, string>();

export const snakeCaseToCamelCase = (value: string): string => {
  const cached = memo.get(value);
  if (cached !== undefined) {
    return cached;
  }

  const result = value.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );
  memo.set(value, result);
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
