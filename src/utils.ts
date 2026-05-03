const memo = new Map<string, string>();

const snakeCaseToCamelCase = (string: string): string => {
  const cached = memo.get(string);
  if (cached !== undefined) {
    return cached;
  }

  const result = string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );
  memo.set(string, result);
  return result;
};

/**
 * Optimized version of cameliseKeys that uses Object.keys() and a standard for-loop
 * to reduce overhead from prototype chain checks and redundant hasOwnProperty calls
 * during runtime data transformation.
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
