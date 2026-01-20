import { Keyable } from './types.js';

/**
 * Optimized lookup structure for IATA code searches.
 * Uses Maps for O(1) exact lookups and prefix-based indexing for efficient partial matching.
 */
interface LookupIndex<T extends Keyable> {
  // Map for exact code lookups (lowercase key -> array of matching items)
  exactMap: Map<string, T[]>;
  // Map for prefix lookups (lowercase prefix -> array of matching items)
  prefixMap: Map<string, T[]>;
  // Original data array
  data: T[];
  // Maximum IATA code length for this dataset
  maxLength: number;
}

/**
 * Build an optimized lookup index from an array of objects with IATA codes.
 * Pre-computes all possible prefixes for efficient partial matching.
 *
 * @param data - Array of objects containing iataCode property
 * @param maxLength - Maximum expected IATA code length (e.g., 2 for airlines, 3 for airports)
 * @returns Optimized lookup index structure
 */
function buildLookupIndex<T extends Keyable>(
  data: T[],
  maxLength: number,
): LookupIndex<T> {
  const exactMap = new Map<string, T[]>();
  const prefixMap = new Map<string, T[]>();

  // Build indexes
  for (const item of data) {
    const iataCode = item.iataCode;
    // Skip items without a valid IATA code string (null, undefined, empty string, or non-string types)
    if (!iataCode || typeof iataCode !== 'string') continue;

    const lowerCode = iataCode.toLowerCase();

    // Add to exact match map
    if (!exactMap.has(lowerCode)) {
      exactMap.set(lowerCode, []);
    }
    // Safe to use non-null assertion: we just checked/created the key above
    exactMap.get(lowerCode)!.push(item);

    // Add to prefix map for all prefixes
    for (let i = 1; i < lowerCode.length; i++) {
      const prefix = lowerCode.substring(0, i);
      if (!prefixMap.has(prefix)) {
        prefixMap.set(prefix, []);
      }
      // Safe to use non-null assertion: we just checked/created the key above
      prefixMap.get(prefix)!.push(item);
    }
  }

  return {
    exactMap,
    prefixMap,
    data,
    maxLength,
  };
}

/**
 * Perform an optimized lookup using the pre-built index.
 * Supports both exact matches and partial prefix matches.
 *
 * @param index - Pre-built lookup index
 * @param partialIataCode - IATA code or partial code to search for
 * @returns Array of matching objects
 */
function lookupByPartialIataCode<T extends Keyable>(
  index: LookupIndex<T>,
  partialIataCode: string,
): T[] {
  // Return empty array if query is longer than max code length
  if (partialIataCode.length > index.maxLength) {
    return [];
  }

  const lowerQuery = partialIataCode.toLowerCase();

  // Check exact map first (full IATA code match)
  if (index.exactMap.has(lowerQuery)) {
    // Safe to use non-null assertion: we just verified the key exists with has()
    return index.exactMap.get(lowerQuery)!;
  }

  // Check prefix map for partial matches
  if (index.prefixMap.has(lowerQuery)) {
    // Safe to use non-null assertion: we just verified the key exists with has()
    return index.prefixMap.get(lowerQuery)!;
  }

  // No matches found
  return [];
}

/**
 * Generic lookup function that works like the original filterObjectsByPartialIataCode.
 * This is a wrapper that maintains the original API signature.
 *
 * Note: This function is provided for compatibility but is not used in the optimized implementation.
 * The preferred approach is to use createLookupFunction() which encapsulates the index.
 *
 * @param objects - Array of objects to search (not used, kept for API compatibility)
 * @param partialIataCode - IATA code or partial code to search for
 * @param iataCodeLength - Maximum IATA code length (validated against index)
 * @param index - Pre-built lookup index to use
 * @returns Array of matching objects
 * @throws Error if iataCodeLength doesn't match the index's maxLength
 */
export function lookupObjects<T extends Keyable>(
  _objects: T[],
  partialIataCode: string,
  iataCodeLength: number,
  index: LookupIndex<T>,
): T[] {
  // Validate that the provided iataCodeLength matches the index configuration
  if (iataCodeLength !== index.maxLength) {
    throw new Error(
      `Configuration mismatch: iataCodeLength (${iataCodeLength}) does not match index maxLength (${index.maxLength})`,
    );
  }
  return lookupByPartialIataCode(index, partialIataCode);
}

/**
 * Create a specialized lookup function for a specific dataset.
 * This function builds the index once and returns a lookup function that uses it.
 *
 * @param data - Array of objects to index
 * @param maxLength - Maximum IATA code length
 * @returns Function that performs optimized lookups on the indexed data
 */
export function createLookupFunction<T extends Keyable>(
  data: T[],
  maxLength: number,
): (partialIataCode: string) => T[] {
  const index = buildLookupIndex(data, maxLength);
  return (partialIataCode: string) => lookupByPartialIataCode(index, partialIataCode);
}

// Export the index building function for advanced use cases
export { buildLookupIndex, lookupByPartialIataCode };
export type { LookupIndex };
