// Utility functions for camelCase transformation in data generation scripts

const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const cameliseKeys = (object) => {
  if (object === null || object === undefined) {
    return object;
  }
  if (typeof object !== 'object') {
    return object;
  }
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );
};

// Recursively camelise keys in an object and its nested objects
export const deepCameliseKeys = (object) => {
  if (object === null || object === undefined) {
    return object;
  }
  if (typeof object !== 'object') {
    return object;
  }

  const camelised = cameliseKeys(object);

  // Recursively camelise nested objects
  for (const [key, value] of Object.entries(camelised)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      camelised[key] = deepCameliseKeys(value);
    }
  }

  return camelised;
};
