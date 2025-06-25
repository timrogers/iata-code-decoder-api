const snakeCaseToCamelCase = (str: string): string => {
  // Handle empty string
  if (!str) return str;
  
  // If string doesn't contain underscores, return as-is to maintain idempotency
  if (!str.includes('_')) return str;
  
  // Extract leading underscores
  const leadingUnderscores = str.match(/^_*/)?.[0] || '';
  const withoutLeading = str.slice(leadingUnderscores.length);
  
  // Extract trailing underscores
  const trailingUnderscores = withoutLeading.match(/_*$/)?.[0] || '';
  const withoutTrailing = withoutLeading.slice(0, withoutLeading.length - trailingUnderscores.length);
  
  // Split by underscores and process each part
  const parts = withoutTrailing.split('_');
  
  // Keep the first part as-is (but lowercase it)
  let result = parts[0].toLowerCase();
  
  // Capitalize first letter of each subsequent non-empty part
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.length > 0) {
      result += part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }
  }
  
  // Add back leading and trailing underscores
  return leadingUnderscores + result + trailingUnderscores;
};

export const cameliseKeys = (object: object): object =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );
