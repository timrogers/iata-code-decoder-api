import { Keyable } from './types.js';

/**
 * IataCodeIndex provides O(1) prefix-based lookups for IATA codes.
 *
 * Instead of scanning all items for each lookup, this class builds
 * a Map-based index at construction time, allowing constant-time
 * lookups for any prefix of an IATA code.
 *
 * For example, with IATA code "LHR":
 * - index["l"] contains all items starting with "L"
 * - index["lh"] contains all items starting with "LH"
 * - index["lhr"] contains all items with exact code "LHR"
 */
export class IataCodeIndex<T extends Keyable> {
  private prefixMap: Map<string, T[]>;
  private iataCodeLength: number;

  /**
   * Build an index for a collection of items with IATA codes.
   *
   * @param items - Array of items with iataCode property
   * @param iataCodeLength - Maximum length of IATA codes in this collection
   */
  constructor(items: T[], iataCodeLength: number) {
    this.prefixMap = new Map();
    this.iataCodeLength = iataCodeLength;
    this.buildIndex(items);
  }

  private buildIndex(items: T[]): void {
    for (const item of items) {
      const iataCode = item.iataCode?.toLowerCase();
      if (!iataCode) continue;

      // Index by all prefixes of the IATA code
      for (let prefixLen = 1; prefixLen <= iataCode.length; prefixLen++) {
        const prefix = iataCode.substring(0, prefixLen);
        const existing = this.prefixMap.get(prefix);
        if (existing) {
          existing.push(item);
        } else {
          this.prefixMap.set(prefix, [item]);
        }
      }
    }
  }

  /**
   * Look up items by partial or full IATA code.
   *
   * @param query - The partial or full IATA code to search for
   * @returns Array of matching items, or empty array if none found
   */
  lookup(query: string): T[] {
    if (query.length > this.iataCodeLength) {
      return [];
    }
    return this.prefixMap.get(query.toLowerCase()) ?? [];
  }
}
