/**
 * Shared helpers for data generation scripts.
 *
 * The Duffel API returns snake_case keys. We convert them to camelCase at
 * generation time so the server can import the JSON directly without any
 * per-record transformation during startup.
 */

/** Turn a single snake_case key into camelCase. */
export const convertKey = (key) =>
  key.replace(/(_[a-z])/gi, (segment) =>
    segment.toUpperCase().replace('-', '').replace('_', ''),
  );

/** Shallow-convert all keys of an object from snake_case to camelCase. */
export const toCamelCaseKeys = (record) =>
  Object.fromEntries(Object.entries(record).map(([k, v]) => [convertKey(k), v]));
