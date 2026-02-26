import { ObjectWithIataCode } from './types.js';

/**
 * A prefix-indexed lookup structure for fast IATA code searches.
 * Pre-indexes all items by their IATA code prefixes for O(1) exact matches
 * and efficient prefix searches.
 */
export interface PrefixIndex<T extends ObjectWithIataCode> {
  /** Map from lowercase IATA code prefix to array of matching items */
  byPrefix: Map<string, T[]>;
  /** All items in the collection */
  all: T[];
  /** Maximum IATA code length for this collection */
  iataCodeLength: number;
}

/**
 * Creates a prefix index for a collection of items with IATA codes.
 * Pre-computes all prefixes (e.g., for "LHR": "l", "lh", "lhr") for fast lookup.
 */
export function createPrefixIndex<T extends ObjectWithIataCode>(
  items: T[],
  iataCodeLength: number,
): PrefixIndex<T> {
  const byPrefix = new Map<string, T[]>();

  for (const item of items) {
    const code = item.iataCode.toLowerCase();
    // Index by each prefix of the IATA code
    for (let len = 1; len <= code.length; len++) {
      const prefix = code.slice(0, len);
      const existing = byPrefix.get(prefix);
      if (existing) {
        existing.push(item);
      } else {
        byPrefix.set(prefix, [item]);
      }
    }
  }

  return { byPrefix, all: items, iataCodeLength };
}

/**
 * Looks up items by partial or complete IATA code using the prefix index.
 * Returns empty array if query is longer than the IATA code length.
 */
export function lookupByIataCode<T extends ObjectWithIataCode>(
  index: PrefixIndex<T>,
  partialIataCode: string,
): T[] {
  if (partialIataCode.length > index.iataCodeLength) {
    return [];
  }

  const normalizedQuery = partialIataCode.toLowerCase();
  return index.byPrefix.get(normalizedQuery) ?? [];
}
