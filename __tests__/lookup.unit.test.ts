import { buildLookupIndex, lookupObjects, createLookupFunction } from '../src/lookup.js';
import { Keyable } from '../src/types.js';

describe('Lookup Module - Unit Tests', () => {
  // Sample test data
  const sampleData: Keyable[] = [
    { iataCode: 'LHR', name: 'London Heathrow' },
    { iataCode: 'LAX', name: 'Los Angeles' },
    { iataCode: 'JFK', name: 'New York JFK' },
    { iataCode: 'BA', name: 'British Airways' },
    { iataCode: 'AA', name: 'American Airlines' },
  ];

  describe('buildLookupIndex', () => {
    it('should build an index with exact match map', () => {
      const index = buildLookupIndex(sampleData, 3);
      expect(index.exactMap.has('lhr')).toBe(true);
      expect(index.exactMap.has('jfk')).toBe(true);
      expect(index.exactMap.get('lhr')).toHaveLength(1);
      expect(index.exactMap.get('lhr')?.[0].name).toBe('London Heathrow');
    });

    it('should build an index with prefix map', () => {
      const index = buildLookupIndex(sampleData, 3);
      expect(index.prefixMap.has('l')).toBe(true);
      expect(index.prefixMap.has('la')).toBe(true);
      expect(index.prefixMap.has('lh')).toBe(true);
      expect(index.prefixMap.get('l')).toHaveLength(2); // LHR and LAX
    });

    it('should handle case-insensitive codes', () => {
      const mixedCase: Keyable[] = [
        { iataCode: 'LhR', name: 'Mixed Case' },
        { iataCode: 'lAx', name: 'Another Mixed' },
      ];
      const index = buildLookupIndex(mixedCase, 3);
      expect(index.exactMap.has('lhr')).toBe(true);
      expect(index.exactMap.has('lax')).toBe(true);
    });

    it('should skip items without iataCode', () => {
      const dataWithMissing: Keyable[] = [
        { iataCode: 'LHR', name: 'London Heathrow' },
        { name: 'No Code' },
        { iataCode: '', name: 'Empty Code' },
        { iataCode: 'JFK', name: 'New York JFK' },
      ];
      const index = buildLookupIndex(dataWithMissing, 3);
      expect(index.exactMap.size).toBe(2);
      expect(index.exactMap.has('lhr')).toBe(true);
      expect(index.exactMap.has('jfk')).toBe(true);
    });

    it('should skip items with non-string iataCode', () => {
      const dataWithInvalidTypes: Keyable[] = [
        { iataCode: 'LHR', name: 'Valid' },
        { iataCode: 123, name: 'Number code' },
        { iataCode: null, name: 'Null code' },
        { iataCode: undefined, name: 'Undefined code' },
        { iataCode: 'JFK', name: 'Valid' },
      ];
      const index = buildLookupIndex(dataWithInvalidTypes, 3);
      expect(index.exactMap.size).toBe(2);
      expect(index.exactMap.has('lhr')).toBe(true);
      expect(index.exactMap.has('jfk')).toBe(true);
    });
  });

  describe('createLookupFunction', () => {
    it('should create a lookup function that finds exact matches', () => {
      const lookup = createLookupFunction(sampleData, 3);
      const results = lookup('LHR');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('London Heathrow');
    });

    it('should create a lookup function that finds partial matches', () => {
      const lookup = createLookupFunction(sampleData, 3);
      const results = lookup('L');
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.iataCode)).toEqual(
        expect.arrayContaining(['LHR', 'LAX']),
      );
    });

    it('should handle case-insensitive queries', () => {
      const lookup = createLookupFunction(sampleData, 3);
      const lower = lookup('lhr');
      const upper = lookup('LHR');
      const mixed = lookup('LhR');
      expect(lower).toEqual(upper);
      expect(upper).toEqual(mixed);
    });

    it('should return empty array for queries longer than max length', () => {
      const lookup = createLookupFunction(sampleData, 3);
      const results = lookup('LHRX');
      expect(results).toEqual([]);
    });

    it('should return empty array for non-existent codes', () => {
      const lookup = createLookupFunction(sampleData, 3);
      const results = lookup('ZZZ');
      expect(results).toEqual([]);
    });
  });

  describe('lookupObjects', () => {
    it('should validate iataCodeLength matches index maxLength', () => {
      const index = buildLookupIndex(sampleData, 3);
      
      // This should work
      expect(() => lookupObjects(sampleData, 'LHR', 3, index)).not.toThrow();
      
      // This should throw
      expect(() => lookupObjects(sampleData, 'LHR', 2, index)).toThrow(
        'Configuration mismatch: iataCodeLength (2) does not match index maxLength (3)',
      );
    });

    it('should perform lookup correctly when validation passes', () => {
      const index = buildLookupIndex(sampleData, 3);
      const results = lookupObjects(sampleData, 'LHR', 3, index);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('London Heathrow');
    });
  });

  describe('Performance characteristics', () => {
    it('should handle multiple items with same IATA code', () => {
      const duplicates: Keyable[] = [
        { iataCode: 'LHR', name: 'London Heathrow', terminal: '1' },
        { iataCode: 'LHR', name: 'London Heathrow', terminal: '2' },
        { iataCode: 'LHR', name: 'London Heathrow', terminal: '3' },
      ];
      const lookup = createLookupFunction(duplicates, 3);
      const results = lookup('LHR');
      expect(results).toHaveLength(3);
    });

    it('should handle prefixes that match multiple codes', () => {
      const airportData: Keyable[] = [
        { iataCode: 'LAX', name: 'Los Angeles' },
        { iataCode: 'LAS', name: 'Las Vegas' },
        { iataCode: 'LAD', name: 'Luanda' },
        { iataCode: 'LHR', name: 'London Heathrow' },
      ];
      const lookup = createLookupFunction(airportData, 3);
      
      const lResults = lookup('L');
      expect(lResults).toHaveLength(4);
      
      const laResults = lookup('LA');
      expect(laResults).toHaveLength(3);
      
      const lasResults = lookup('LAS');
      expect(lasResults).toHaveLength(1);
    });

    it('should handle numeric codes correctly', () => {
      const aircraftData: Keyable[] = [
        { iataCode: '777', name: 'Boeing 777' },
        { iataCode: '747', name: 'Boeing 747' },
        { iataCode: '737', name: 'Boeing 737' },
      ];
      const lookup = createLookupFunction(aircraftData, 3);
      
      const results7 = lookup('7');
      expect(results7).toHaveLength(3);
      
      const results77 = lookup('77');
      expect(results77).toHaveLength(1);
      expect(results77[0].iataCode).toBe('777');
    });
  });
});
