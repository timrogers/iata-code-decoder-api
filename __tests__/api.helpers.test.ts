import { filterObjectsByPartialIataCode } from '../src/api.js';

describe('api helpers', () => {
  describe('filterObjectsByPartialIataCode', () => {
    const mockAirports = [
      { iataCode: 'LHR', name: 'London Heathrow' },
      { iataCode: 'LAX', name: 'Los Angeles International' },
      { iataCode: 'JFK', name: 'John F Kennedy International' },
      { iataCode: 'LGA', name: 'LaGuardia' },
      { iataCode: 'ORD', name: "O'Hare International" },
    ];

    const mockAirlines = [
      { iataCode: 'BA', name: 'British Airways' },
      { iataCode: 'AA', name: 'American Airlines' },
      { iataCode: 'UA', name: 'United Airlines' },
    ];

    it('should filter objects by exact IATA code match', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'LHR', 3);

      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('LHR');
    });

    it('should filter objects by partial IATA code match', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'L', 3);

      expect(result).toHaveLength(3);
      expect(result.map((a) => a.iataCode).sort()).toEqual(['LAX', 'LGA', 'LHR']);
    });

    it('should be case-insensitive', () => {
      const resultLower = filterObjectsByPartialIataCode(mockAirports, 'lhr', 3);
      const resultUpper = filterObjectsByPartialIataCode(mockAirports, 'LHR', 3);
      const resultMixed = filterObjectsByPartialIataCode(mockAirports, 'lHr', 3);

      expect(resultLower).toEqual(resultUpper);
      expect(resultLower).toEqual(resultMixed);
    });

    it('should return empty array when query is longer than IATA code length', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'LHRX', 3);

      expect(result).toEqual([]);
    });

    it('should return empty array when no matches are found', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'Z', 3);

      expect(result).toEqual([]);
    });

    it('should work with 2-letter airline codes', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'A', 2);

      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('AA');
    });

    it('should return empty array for airline queries longer than 2 characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'BAA', 2);

      expect(result).toEqual([]);
    });

    it('should handle empty input array', () => {
      const result = filterObjectsByPartialIataCode([], 'LHR', 3);

      expect(result).toEqual([]);
    });

    it('should handle single character queries', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'J', 3);

      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('JFK');
    });

    it('should match multiple objects with same prefix', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'L', 3);

      expect(result).toHaveLength(3);
      expect(result.map((a) => a.iataCode).sort()).toEqual(['LAX', 'LGA', 'LHR']);
    });

    it('should handle two-letter complete match', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'BA', 2);

      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('BA');
    });
  });
});
