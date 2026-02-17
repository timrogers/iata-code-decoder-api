/**
 * Utility functions for building and using prefix indexes for fast lookups
 */

export interface Indexable {
  iataCode: string;
}

export type PrefixIndex<T> = Map<string, T[]>;

/**
 * Build a prefix index for fast O(1) lookups
 * @param items - Array of items with iataCode property
 * @param maxLength - Maximum IATA code length (e.g., 2 for airlines, 3 for airports)
 * @returns Map of prefix -> items[]
 */
export function buildPrefixIndex<T extends Indexable>(
  items: T[],
  maxLength: number
): PrefixIndex<T> {
  const index = new Map<string, T[]>();

  for (const item of items) {
    const code = item.iataCode.toLowerCase();
    
    // Build index for all prefixes (e.g., "L", "LH", "LHR")
    for (let i = 1; i <= Math.min(code.length, maxLength); i++) {
      const prefix = code.substring(0, i);
      
      const existing = index.get(prefix);
      if (existing) {
        existing.push(item);
      } else {
        index.set(prefix, [item]);
      }
    }
  }

  return index;
}

/**
 * Look up items by prefix using the index
 * @param index - Prefix index built with buildPrefixIndex
 * @param query - Query string (will be lowercased)
 * @param maxLength - Maximum valid query length
 * @returns Array of matching items (empty if query too long)
 */
export function lookupByPrefix<T>(
  index: PrefixIndex<T>,
  query: string,
  maxLength: number
): T[] {
  // Return empty array if query is too long
  if (query.length > maxLength) {
    return [];
  }

  const results = index.get(query.toLowerCase());
  return results || [];
}

/**
 * Get index statistics
 */
export function getIndexStats<T>(index: PrefixIndex<T>) {
  let totalEntries = 0;
  let totalItems = 0;
  
  for (const items of index.values()) {
    totalEntries++;
    totalItems += items.length;
  }

  return {
    prefixCount: totalEntries,
    totalItems,
    avgItemsPerPrefix: (totalItems / totalEntries).toFixed(2)
  };
}
