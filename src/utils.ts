const camelToSnakeCase = (string : string): string => string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const snakifyKeys = (object : object) : object => Object.fromEntries(
  Object.entries(object).map(([key, value]) => [camelToSnakeCase(key), value])
);