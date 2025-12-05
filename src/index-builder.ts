import { ObjectWithIataCode } from './types.js';

/**
 * Builds a pre-computed index grouped by first character(s) of IATA codes for O(1) lookups.
 * The index maps each possible prefix (1 char, 2 chars, etc. up to iataCodeLength) to matching items.
 *
 * @param objects - Array of objects with iataCode property
 * @param iataCodeLength - Maximum length of the IATA code (e.g., 3 for airports, 2 for airlines)
 * @returns A Map where keys are lowercase prefixes and values are arrays of matching objects
 */
export const buildIataIndex = <T extends ObjectWithIataCode>(
  objects: T[],
  iataCodeLength: number,
): Map<string, T[]> => {
  const index = new Map<string, T[]>();

  for (const obj of objects) {
    const iataCode = obj.iataCode.toLowerCase();

    // Add to index for each prefix length (1 char, 2 chars, ..., full code)
    for (
      let prefixLen = 1;
      prefixLen <= Math.min(iataCode.length, iataCodeLength);
      prefixLen++
    ) {
      const prefix = iataCode.substring(0, prefixLen);
      const existing = index.get(prefix);
      if (existing) {
        existing.push(obj);
      } else {
        index.set(prefix, [obj]);
      }
    }
  }

  return index;
};

/**
 * Looks up objects by IATA code prefix using the pre-computed index.
 * Returns an empty array if the prefix is longer than the iataCodeLength.
 *
 * @param index - The pre-computed index
 * @param partialIataCode - The partial IATA code to search for
 * @param iataCodeLength - Maximum length of the IATA code
 * @returns Array of matching objects, or empty array if none found
 */
export const lookupByIataPrefix = <T extends ObjectWithIataCode>(
  index: Map<string, T[]>,
  partialIataCode: string,
  iataCodeLength: number,
): T[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  }
  return index.get(partialIataCode.toLowerCase()) || [];
};
