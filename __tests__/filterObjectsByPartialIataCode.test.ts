import { filterObjectsByPartialIataCode } from '../src/api.js';
import { Keyable } from '../src/types.js';

describe('filterObjectsByPartialIataCode', () => {
  const testObjects: Keyable[] = [
    { iataCode: 'LHR', name: 'London Heathrow' },
    { iataCode: 'LGW', name: 'London Gatwick' },
    { iataCode: 'LAX', name: 'Los Angeles' },
    { iataCode: 'JFK', name: 'John F. Kennedy' },
    { iataCode: 'CDG', name: 'Charles de Gaulle' },
  ];

  it('should return exact match for full IATA code', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'LHR', 3);
    expect(result).toEqual([{ iataCode: 'LHR', name: 'London Heathrow' }]);
  });

  it('should return all objects matching a partial code', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'L', 3);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.iataCode)).toEqual(['LHR', 'LGW', 'LAX']);
  });

  it('should return all objects matching a two-letter partial code', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'LH', 3);
    expect(result).toHaveLength(1);
    expect(result[0].iataCode).toBe('LHR');
  });

  it('should be case-insensitive', () => {
    const resultLower = filterObjectsByPartialIataCode(testObjects, 'lhr', 3);
    const resultUpper = filterObjectsByPartialIataCode(testObjects, 'LHR', 3);
    const resultMixed = filterObjectsByPartialIataCode(testObjects, 'Lhr', 3);

    expect(resultLower).toEqual(resultUpper);
    expect(resultLower).toEqual(resultMixed);
    expect(resultLower).toHaveLength(1);
  });

  it('should return empty array when query is longer than iataCodeLength', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'LHRX', 3);
    expect(result).toEqual([]);
  });

  it('should return empty array when no objects match', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'ZZ', 3);
    expect(result).toEqual([]);
  });

  it('should return all objects when query is empty string', () => {
    const result = filterObjectsByPartialIataCode(testObjects, '', 3);
    expect(result).toHaveLength(5);
  });

  it('should handle empty objects array', () => {
    const result = filterObjectsByPartialIataCode([], 'LHR', 3);
    expect(result).toEqual([]);
  });

  it('should respect different iataCodeLength values', () => {
    const twoLetterObjects: Keyable[] = [
      { iataCode: 'BA', name: 'British Airways' },
      { iataCode: 'AA', name: 'American Airlines' },
      { iataCode: 'AF', name: 'Air France' },
    ];

    // With length 2, a 3-character query should return empty
    const result = filterObjectsByPartialIataCode(twoLetterObjects, 'BAA', 2);
    expect(result).toEqual([]);

    // With length 2, a 2-character query should work
    const result2 = filterObjectsByPartialIataCode(twoLetterObjects, 'BA', 2);
    expect(result2).toHaveLength(1);
    expect(result2[0].iataCode).toBe('BA');

    // With length 2, a 1-character query should work
    const result3 = filterObjectsByPartialIataCode(twoLetterObjects, 'A', 2);
    expect(result3).toHaveLength(2);
  });

  it('should handle single character IATA codes in data', () => {
    const objects: Keyable[] = [{ iataCode: 'A', name: 'Single char' }];
    const result = filterObjectsByPartialIataCode(objects, 'A', 3);
    expect(result).toHaveLength(1);
  });

  it('should match correctly when query length equals iataCodeLength', () => {
    const result = filterObjectsByPartialIataCode(testObjects, 'JFK', 3);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John F. Kennedy');
  });
});
