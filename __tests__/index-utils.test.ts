import { IataCodeIndex } from '../src/index-utils.js';

interface TestItem {
  iataCode: string;
  name: string;
}

describe('IataCodeIndex', () => {
  const testData: TestItem[] = [
    { iataCode: 'LHR', name: 'London Heathrow' },
    { iataCode: 'LGW', name: 'London Gatwick' },
    { iataCode: 'LTN', name: 'London Luton' },
    { iataCode: 'JFK', name: 'New York JFK' },
    { iataCode: 'LAX', name: 'Los Angeles' },
  ];

  const index = new IataCodeIndex(testData, 3);

  describe('lookup', () => {
    it('should return empty array for query longer than IATA code length', () => {
      expect(index.lookup('LHRX')).toEqual([]);
      expect(index.lookup('ABCD')).toEqual([]);
    });

    it('should return all items starting with single character prefix', () => {
      const result = index.lookup('L');
      expect(result.length).toBe(4);
      expect(result.map((r) => r.iataCode).sort()).toEqual(['LAX', 'LGW', 'LHR', 'LTN']);
    });

    it('should return items starting with two character prefix', () => {
      const result = index.lookup('LH');
      expect(result.length).toBe(1);
      expect(result[0].iataCode).toBe('LHR');
    });

    it('should return exact match for full IATA code', () => {
      const result = index.lookup('JFK');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('New York JFK');
    });

    it('should be case-insensitive', () => {
      expect(index.lookup('lhr')).toEqual(index.lookup('LHR'));
      expect(index.lookup('Lhr')).toEqual(index.lookup('LHR'));
      expect(index.lookup('l')).toEqual(index.lookup('L'));
    });

    it('should return empty array for non-matching query', () => {
      expect(index.lookup('X')).toEqual([]);
      expect(index.lookup('ZZ')).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      const emptyIndex = new IataCodeIndex<TestItem>([], 3);
      expect(emptyIndex.lookup('L')).toEqual([]);
    });

    it('should handle items with missing iataCode', () => {
      const dataWithMissing = [
        { iataCode: 'ABC', name: 'Airport ABC' },
        { name: 'No Code' } as TestItem,
        { iataCode: 'DEF', name: 'Airport DEF' },
      ];
      const indexWithMissing = new IataCodeIndex(dataWithMissing, 3);
      expect(indexWithMissing.lookup('A').length).toBe(1);
      expect(indexWithMissing.lookup('D').length).toBe(1);
    });
  });
});
