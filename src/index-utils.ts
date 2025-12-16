import { Keyable } from './types.js';

/**
 * Index structure that maps lowercase prefixes to arrays of matching objects.
 * For example, for IATA code "LHR":
 * - "l" -> [LHR, LAX, LGA, ...]
 * - "lh" -> [LHR, LHE, ...]
 * - "lhr" -> [LHR]
 */
export class IataCodeIndex {
  private index: Map<string, Keyable[]>;
  private maxCodeLength: number;

  constructor(objects: Keyable[], maxCodeLength: number) {
    this.maxCodeLength = maxCodeLength;
    this.index = this.buildIndex(objects);
  }

  /**
   * Build a prefix index for fast lookups.
   * Time complexity: O(n * m) where n = number of objects, m = max code length
   * Space complexity: O(n * m) for storing all prefixes
   */
  private buildIndex(objects: Keyable[]): Map<string, Keyable[]> {
    const index = new Map<string, Keyable[]>();

    for (const object of objects) {
      const iataCode = object.iataCode;
      if (!iataCode || typeof iataCode !== 'string' || iataCode.trim() === '') {
        continue;
      }

      const lowerCode = iataCode.toLowerCase();
      const codeLength = Math.min(lowerCode.length, this.maxCodeLength);

      // Add the object to all its prefixes
      for (let i = 1; i <= codeLength; i++) {
        const prefix = lowerCode.substring(0, i);
        if (!index.has(prefix)) {
          index.set(prefix, []);
        }
        index.get(prefix)!.push(object);
      }
    }

    return index;
  }

  /**
   * Look up objects by partial IATA code.
   * Time complexity: O(1) average case for Map lookup
   * Space complexity: O(1) returns reference to existing array
   */
  lookup(partialIataCode: string): Keyable[] {
    // Validate and sanitize input
    if (
      !partialIataCode ||
      typeof partialIataCode !== 'string' ||
      partialIataCode.trim() === ''
    ) {
      return [];
    }

    const trimmedQuery = partialIataCode.trim();

    if (trimmedQuery.length > this.maxCodeLength) {
      return [];
    }

    const lowerQuery = trimmedQuery.toLowerCase();
    return this.index.get(lowerQuery) || [];
  }
}
