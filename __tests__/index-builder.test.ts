import { buildIataIndex, lookupByIataPrefix } from '../src/index-builder.js';
import { ObjectWithIataCode } from '../src/types.js';

interface TestObject extends ObjectWithIataCode {
  id: string;
  name: string;
  iataCode: string;
}

describe('Index Builder', () => {
  const testObjects: TestObject[] = [
    { id: '1', name: 'London Heathrow', iataCode: 'LHR' },
    { id: '2', name: 'Los Angeles', iataCode: 'LAX' },
    { id: '3', name: 'JFK', iataCode: 'JFK' },
    { id: '4', name: 'Logan International', iataCode: 'LGA' },
    { id: '5', name: 'Lima Airport', iataCode: 'LIM' },
  ];

  describe('buildIataIndex', () => {
    it('should build an index with all prefixes up to iataCodeLength', () => {
      const index = buildIataIndex(testObjects, 3);

      // Check first character lookups
      expect(index.get('l')).toHaveLength(4); // LHR, LAX, LGA, LIM
      expect(index.get('j')).toHaveLength(1); // JFK

      // Check two character lookups
      expect(index.get('lh')).toHaveLength(1); // LHR
      expect(index.get('la')).toHaveLength(1); // LAX
      expect(index.get('lg')).toHaveLength(1); // LGA
      expect(index.get('li')).toHaveLength(1); // LIM
      expect(index.get('jf')).toHaveLength(1); // JFK

      // Check full code lookups
      expect(index.get('lhr')).toHaveLength(1);
      expect(index.get('lax')).toHaveLength(1);
      expect(index.get('jfk')).toHaveLength(1);
    });

    it('should store lowercase keys', () => {
      const index = buildIataIndex(testObjects, 3);

      expect(index.has('L')).toBe(false);
      expect(index.has('l')).toBe(true);
      expect(index.has('LHR')).toBe(false);
      expect(index.has('lhr')).toBe(true);
    });

    it('should handle empty input array', () => {
      const index = buildIataIndex<TestObject>([], 3);
      expect(index.size).toBe(0);
    });

    it('should handle 2-character IATA codes (like airlines)', () => {
      const airlines: TestObject[] = [
        { id: '1', name: 'British Airways', iataCode: 'BA' },
        { id: '2', name: 'American Airlines', iataCode: 'AA' },
        { id: '3', name: 'Austrian Airlines', iataCode: 'OS' },
      ];

      const index = buildIataIndex(airlines, 2);

      expect(index.get('b')).toHaveLength(1);
      expect(index.get('a')).toHaveLength(1);
      expect(index.get('ba')).toHaveLength(1);
      expect(index.get('aa')).toHaveLength(1);
      expect(index.get('os')).toHaveLength(1);
    });
  });

  describe('lookupByIataPrefix', () => {
    const index = buildIataIndex(testObjects, 3);

    it('should return matching objects for valid prefix', () => {
      const results = lookupByIataPrefix(index, 'L', 3);
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.iataCode)).toEqual(
        expect.arrayContaining(['LHR', 'LAX', 'LGA', 'LIM']),
      );
    });

    it('should be case-insensitive', () => {
      const resultsUpper = lookupByIataPrefix(index, 'LHR', 3);
      const resultsLower = lookupByIataPrefix(index, 'lhr', 3);
      const resultsMixed = lookupByIataPrefix(index, 'Lhr', 3);

      expect(resultsUpper).toEqual(resultsLower);
      expect(resultsUpper).toEqual(resultsMixed);
    });

    it('should return empty array for queries longer than iataCodeLength', () => {
      const results = lookupByIataPrefix(index, 'LHRX', 3);
      expect(results).toEqual([]);
    });

    it('should return empty array for non-existent prefix', () => {
      const results = lookupByIataPrefix(index, 'ZZZ', 3);
      expect(results).toEqual([]);
    });

    it('should return exact match for full code', () => {
      const results = lookupByIataPrefix(index, 'LHR', 3);
      expect(results).toHaveLength(1);
      expect(results[0].iataCode).toBe('LHR');
    });

    it('should work with 2-character codes (like airlines)', () => {
      const airlines: TestObject[] = [
        { id: '1', name: 'British Airways', iataCode: 'BA' },
        { id: '2', name: 'Bamboo Airways', iataCode: 'QH' },
      ];

      const airlineIndex = buildIataIndex(airlines, 2);

      const resultsB = lookupByIataPrefix(airlineIndex, 'B', 2);
      expect(resultsB).toHaveLength(1);
      expect(resultsB[0].iataCode).toBe('BA');

      // Query longer than iataCodeLength should return empty
      const resultsBAA = lookupByIataPrefix(airlineIndex, 'BAA', 2);
      expect(resultsBAA).toEqual([]);
    });
  });
});
