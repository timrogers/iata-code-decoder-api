import {
  buildSearchIndex,
  searchByCode,
  getIndexStats,
  SearchIndex,
} from '../src/search-index';

describe('SearchIndex', () => {
  // Sample test data
  const airports = [
    { iataCode: 'LHR', name: 'London Heathrow', city: 'London' },
    { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
    { iataCode: 'LGA', name: 'LaGuardia', city: 'New York' },
    { iataCode: 'JFK', name: 'John F Kennedy', city: 'New York' },
    { iataCode: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
  ];

  const airlines = [
    { iataCode: 'BA', name: 'British Airways' },
    { iataCode: 'AA', name: 'American Airlines' },
    { iataCode: 'UA', name: 'United Airlines' },
  ];

  describe('buildSearchIndex', () => {
    test('should create index with exact and prefix maps', () => {
      const index = buildSearchIndex(airports, 3);

      expect(index).toHaveProperty('exact');
      expect(index).toHaveProperty('prefix');
      expect(index.exact).toBeInstanceOf(Map);
      expect(index.prefix).toBeInstanceOf(Map);
    });

    test('should store exact matches', () => {
      const index = buildSearchIndex(airports, 3);

      const lhrResults = index.exact.get('lhr');
      expect(lhrResults).toBeDefined();
      expect(lhrResults).toHaveLength(1);
      expect((lhrResults![0] as (typeof airports)[0]).name).toBe('London Heathrow');
    });

    test('should store prefix matches', () => {
      const index = buildSearchIndex(airports, 3);

      // Single character prefix
      const lResults = index.prefix.get('l');
      expect(lResults).toBeDefined();
      expect(lResults!.length).toBe(3); // LHR, LAX, LGA

      // Two character prefix
      const laResults = index.prefix.get('la');
      expect(laResults).toBeDefined();
      expect(laResults!.length).toBe(1); // LAX only (LGA starts with 'lg')

      // Three character prefix (same as exact)
      const lhrResults = index.prefix.get('lhr');
      expect(lhrResults).toBeDefined();
      expect(lhrResults!.length).toBe(1); // LHR
    });

    test('should normalize case to lowercase', () => {
      const index = buildSearchIndex(airports, 3);

      const upperResults = index.exact.get('LHR');
      const lowerResults = index.exact.get('lhr');

      expect(upperResults).toBeUndefined();
      expect(lowerResults).toBeDefined();
    });

    test('should handle airlines with 2-character codes', () => {
      const index = buildSearchIndex(airlines, 2);

      expect(index.exact.get('ba')).toHaveLength(1);
      expect(index.prefix.get('b')).toHaveLength(1);
      expect(index.prefix.get('ba')).toHaveLength(1);
    });

    test('should handle empty dataset', () => {
      const index = buildSearchIndex([], 3);

      expect(index.exact.size).toBeGreaterThanOrEqual(0);
      expect(index.prefix.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchByCode', () => {
    let airportIndex: SearchIndex<(typeof airports)[0]>;
    let airlineIndex: SearchIndex<(typeof airlines)[0]>;

    beforeEach(() => {
      airportIndex = buildSearchIndex(airports, 3);
      airlineIndex = buildSearchIndex(airlines, 2);
    });

    describe('exact matches', () => {
      test('should find exact airport match', () => {
        const results = searchByCode<(typeof airports)[0]>(airportIndex, 'LHR', 3);

        expect(results).toHaveLength(1);
        expect(results[0].iataCode).toBe('LHR');
        expect(results[0].name).toBe('London Heathrow');
      });

      test('should find exact airline match', () => {
        const results = searchByCode<(typeof airlines)[0]>(airlineIndex, 'BA', 2);

        expect(results).toHaveLength(1);
        expect(results[0].iataCode).toBe('BA');
        expect(results[0].name).toBe('British Airways');
      });

      test('should return empty array for non-existent code', () => {
        const results = searchByCode(airportIndex, 'XXX', 3);

        expect(results).toHaveLength(0);
      });
    });

    describe('prefix matches', () => {
      test('should find all airports starting with L', () => {
        const results = searchByCode<(typeof airports)[0]>(airportIndex, 'L', 3);

        expect(results.length).toBe(3);
        expect(results.every((r) => r.iataCode.startsWith('L'))).toBe(true);
      });

      test('should find all airports starting with LA', () => {
        const results = searchByCode<(typeof airports)[0]>(airportIndex, 'LA', 3);

        expect(results.length).toBe(1);
        const codes = results.map((r) => r.iataCode);
        expect(codes).toContain('LAX');
        // Note: LGA starts with 'LG', not 'LA'
      });

      test('should find all airlines starting with A', () => {
        const results = searchByCode<(typeof airlines)[0]>(airlineIndex, 'A', 2);

        expect(results.length).toBe(1);
        const codes = results.map((r) => r.iataCode);
        expect(codes).toContain('AA');
        // Note: UA starts with 'U', not 'A'
      });

      test('should return empty array for prefix with no matches', () => {
        const results = searchByCode(airportIndex, 'Z', 3);

        expect(results).toHaveLength(0);
      });
    });

    describe('case insensitivity', () => {
      test('should handle uppercase query', () => {
        const upper = searchByCode(airportIndex, 'LHR', 3);
        const lower = searchByCode(airportIndex, 'lhr', 3);

        expect(upper).toEqual(lower);
      });

      test('should handle mixed case query', () => {
        const mixed = searchByCode(airportIndex, 'LhR', 3);
        const lower = searchByCode(airportIndex, 'lhr', 3);

        expect(mixed).toEqual(lower);
      });

      test('should handle uppercase prefix', () => {
        const upper = searchByCode(airportIndex, 'L', 3);
        const lower = searchByCode(airportIndex, 'l', 3);

        expect(upper).toEqual(lower);
      });
    });

    describe('query length validation', () => {
      test('should return empty array for query longer than max length', () => {
        const results = searchByCode(airportIndex, 'LHRX', 3);

        expect(results).toHaveLength(0);
      });

      test('should handle query at max length', () => {
        const results = searchByCode(airportIndex, 'LHR', 3);

        expect(results.length).toBeGreaterThan(0);
      });

      test('should handle airline query longer than 2 chars', () => {
        const results = searchByCode(airlineIndex, 'BAA', 2);

        expect(results).toHaveLength(0);
      });
    });

    describe('edge cases', () => {
      test('should handle empty query', () => {
        const results = searchByCode(airportIndex, '', 3);

        expect(results).toHaveLength(0);
      });

      test('should handle single character query', () => {
        const results = searchByCode<(typeof airports)[0]>(airportIndex, 'J', 3);

        expect(results.length).toBe(1);
        expect(results[0].iataCode).toBe('JFK');
      });

      test('should handle numeric codes', () => {
        const aircraftData = [
          { iataCode: '777', name: 'Boeing 777' },
          { iataCode: '747', name: 'Boeing 747' },
        ];
        const index = buildSearchIndex(aircraftData, 3);

        const results = searchByCode(index, '7', 3);
        expect(results.length).toBe(2);
      });
    });

    describe('performance characteristics', () => {
      test('should handle large result sets efficiently', () => {
        // Create a large dataset
        const largeDataset = Array(10000)
          .fill(null)
          .map((_, i) => ({
            iataCode: `A${String(i).padStart(2, '0')}`,
            name: `Airport ${i}`,
          }));

        const index = buildSearchIndex(largeDataset, 3);

        const start = performance.now();
        const results = searchByCode(index, 'A', 3);
        const duration = performance.now() - start;

        expect(results.length).toBe(10000);
        expect(duration).toBeLessThan(10); // Should be very fast
      });
    });
  });

  describe('getIndexStats', () => {
    test('should return statistics for airport index', () => {
      const index = buildSearchIndex(airports, 3);
      const stats = getIndexStats(index);

      expect(stats).toHaveProperty('exactEntries');
      expect(stats).toHaveProperty('prefixEntries');
      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('estimatedMemoryMB');

      expect(stats.exactEntries).toBe(5); // 5 unique airports
      expect(stats.totalItems).toBe(5);
      expect(stats.estimatedMemoryMB).toBeGreaterThan(0);
    });

    test('should return statistics for airline index', () => {
      const index = buildSearchIndex(airlines, 2);
      const stats = getIndexStats(index);

      expect(stats.exactEntries).toBe(3); // 3 unique airlines
      expect(stats.totalItems).toBe(3);
      expect(stats.estimatedMemoryMB).toBeGreaterThan(0);
    });

    test('should handle empty index', () => {
      const index = buildSearchIndex([], 3);
      const stats = getIndexStats(index);

      expect(stats.totalItems).toBe(0);
    });
  });

  describe('comparison with linear filter', () => {
    // Original filter function for comparison
    const linearFilter = (
      items: unknown[],
      query: string,
      maxLength: number,
    ): unknown[] => {
      if (query.length > maxLength) {
        return [];
      }
      return items.filter((item) =>
        (item as { iataCode: string }).iataCode
          .toLowerCase()
          .startsWith(query.toLowerCase()),
      );
    };

    test('should produce identical results to linear filter for exact match', () => {
      const index = buildSearchIndex(airports, 3);

      const indexResults = searchByCode(index, 'LHR', 3);
      const filterResults = linearFilter(airports, 'LHR', 3);

      expect(indexResults.length).toBe(filterResults.length);
      expect(indexResults[0]).toEqual(filterResults[0]);
    });

    test('should produce identical results to linear filter for prefix', () => {
      const index = buildSearchIndex(airports, 3);

      const indexResults = searchByCode<(typeof airports)[0]>(index, 'L', 3);
      const filterResults = linearFilter(airports, 'L', 3);

      expect(indexResults.length).toBe(filterResults.length);

      const indexCodes = indexResults.map((r) => r.iataCode).sort();
      const filterCodes = filterResults
        .map((r) => (r as (typeof airports)[0]).iataCode)
        .sort();
      expect(indexCodes).toEqual(filterCodes);
    });

    test('should produce identical results for case-insensitive queries', () => {
      const index = buildSearchIndex(airports, 3);

      const indexResults = searchByCode(index, 'lhr', 3);
      const filterResults = linearFilter(airports, 'lhr', 3);

      expect(indexResults).toEqual(filterResults);
    });

    test('should produce identical results for queries exceeding max length', () => {
      const index = buildSearchIndex(airports, 3);

      const indexResults = searchByCode(index, 'LHRX', 3);
      const filterResults = linearFilter(airports, 'LHRX', 3);

      expect(indexResults).toEqual(filterResults);
    });
  });
});
