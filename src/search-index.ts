import { Keyable } from './types.js';

interface SearchIndex {
  prefixMap: Map<string, Keyable[]>;
  fullIndex: Map<string, Keyable>;
}

class SearchIndexBuilder {
  static buildIndex(objects: Keyable[], maxPrefixLength: number): SearchIndex {
    const prefixMap = new Map<string, Keyable[]>();
    const fullIndex = new Map<string, Keyable>();

    for (const object of objects) {
      const iataCode = object.iataCode.toLowerCase();
      
      // Add to full index for exact matches
      fullIndex.set(iataCode, object);

      // Add to prefix map for partial matches
      for (let i = 1; i <= Math.min(iataCode.length, maxPrefixLength); i++) {
        const prefix = iataCode.substring(0, i);
        
        if (!prefixMap.has(prefix)) {
          prefixMap.set(prefix, []);
        }
        prefixMap.get(prefix)!.push(object);
      }
    }

    return { prefixMap, fullIndex };
  }

  static searchByPrefix(
    index: SearchIndex,
    query: string,
    maxResults: number = 100
  ): Keyable[] {
    const normalizedQuery = query.toLowerCase();
    
    // Try exact match first
    const exactMatch = index.fullIndex.get(normalizedQuery);
    if (exactMatch) {
      return [exactMatch];
    }

    // Fall back to prefix search
    const results = index.prefixMap.get(normalizedQuery) || [];
    
    // Limit results and sort by IATA code length for better relevance
    return results
      .sort((a, b) => a.iataCode.length - b.iataCode.length)
      .slice(0, maxResults);
  }
}

export { SearchIndex, SearchIndexBuilder };