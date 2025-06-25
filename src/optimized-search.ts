import { Keyable } from './types.js';
import { SearchCache } from './search-cache.js';
import { SearchIndex, SearchIndexBuilder } from './search-index.js';

class OptimizedSearchService {
  private cache: SearchCache<Keyable[]>;
  private index: SearchIndex;
  private maxResults: number;

  constructor(
    objects: Keyable[],
    iataCodeLength: number,
    maxResults: number = 100,
    cacheSize: number = 1000
  ) {
    this.cache = new SearchCache<Keyable[]>(30, cacheSize); // 30 min TTL
    this.index = SearchIndexBuilder.buildIndex(objects, iataCodeLength);
    this.maxResults = maxResults;
  }

  search(query: string): Keyable[] {
    // Input validation
    if (!query || typeof query !== 'string') {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return [];
    }

    // Check cache first
    const cacheKey = `search:${normalizedQuery}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Perform search
    const results = SearchIndexBuilder.searchByPrefix(
      this.index,
      normalizedQuery,
      this.maxResults
    );

    // Cache the result
    this.cache.set(cacheKey, results);

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }
}

export { OptimizedSearchService };