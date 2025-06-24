import { Keyable } from './types.js';

export interface SearchIndex {
  exact: Map<string, Keyable[]>;
  prefixes: Map<string, Keyable[]>;
}

/**
 * Creates an optimized search index for IATA code lookups
 * @param objects Array of objects with iataCode property
 * @param maxCodeLength Maximum length of IATA codes (2 for airlines, 3 for airports/aircraft)
 * @returns SearchIndex with exact matches and prefix maps
 */
export function createSearchIndex(objects: Keyable[], maxCodeLength: number): SearchIndex {
  const exact = new Map<string, Keyable[]>();
  const prefixes = new Map<string, Keyable[]>();

  for (const object of objects) {
    if (!object.iataCode) continue;

    const code = object.iataCode.toLowerCase();
    
    // Store exact matches
    if (!exact.has(code)) {
      exact.set(code, []);
    }
    exact.get(code)!.push(object);

    // Store all prefixes for efficient partial matching
    for (let i = 1; i <= Math.min(code.length, maxCodeLength); i++) {
      const prefix = code.substring(0, i);
      if (!prefixes.has(prefix)) {
        prefixes.set(prefix, []);
      }
      prefixes.get(prefix)!.push(object);
    }
  }

  return { exact, prefixes };
}

/**
 * Fast search using pre-built index
 * @param index SearchIndex to search in
 * @param partialCode Partial IATA code to search for
 * @param maxCodeLength Maximum allowed code length
 * @returns Array of matching objects
 */
export function searchIndex(
  index: SearchIndex,
  partialCode: string,
  maxCodeLength: number,
): Keyable[] {
  if (!partialCode || partialCode.length > maxCodeLength) {
    return [];
  }

  const normalizedCode = partialCode.toLowerCase();
  
  // Try exact match first (fastest)
  const exactMatches = index.exact.get(normalizedCode);
  if (exactMatches) {
    return [...exactMatches];
  }

  // Try prefix match
  const prefixMatches = index.prefixes.get(normalizedCode);
  if (prefixMatches) {
    return [...prefixMatches];
  }

  return [];
}

/**
 * Get statistics about the search index
 * @param index SearchIndex to analyze
 * @returns Statistics object
 */
export function getIndexStats(index: SearchIndex) {
  return {
    exactEntries: index.exact.size,
    prefixEntries: index.prefixes.size,
    totalMemoryEntries: index.exact.size + index.prefixes.size,
  };
}