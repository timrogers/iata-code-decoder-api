import { Keyable } from './types.js';

/**
 * Pre-computed prefix index for O(1) IATA code lookups instead of O(n) filtering.
 */
export class PrefixIndex {
  private index: Map<string, Keyable[]>;
  private maxKeyLength: number;

  constructor(objects: Keyable[], maxKeyLength: number) {
    this.maxKeyLength = maxKeyLength;
    this.index = new Map();

    for (const obj of objects) {
      const code = obj.iataCode.toLowerCase();
      for (let len = 1; len <= Math.min(code.length, this.maxKeyLength); len++) {
        const prefix = code.substring(0, len);
        if (!this.index.has(prefix)) {
          this.index.set(prefix, []);
        }
        this.index.get(prefix)!.push(obj);
      }
    }
  }

  lookup(query: string): Keyable[] {
    const normalized = query.toLowerCase();

    // For over-length queries, use the longest valid prefix for a best-effort match
    if (normalized.length > this.maxKeyLength) {
      const truncated = normalized.substring(0, this.maxKeyLength);
      return this.index.get(truncated) ?? [];
    }

    return this.index.get(normalized) ?? [];
  }
}
