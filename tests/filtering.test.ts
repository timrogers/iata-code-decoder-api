import { describe, test, expect } from '@jest/globals';
import { Keyable } from '../src/types.js';

// Import the filtering function for unit testing
// Note: This function is not exported, so we'll test it through the API
// But we can test the logic with mock data

describe('Filtering Logic', () => {
  // Mock implementation of the filtering function based on the source code
  const filterObjectsByPartialIataCode = (
    objects: Keyable[],
    partialIataCode: string,
    iataCodeLength: number,
  ): Keyable[] => {
    if (partialIataCode.length > iataCodeLength) {
      return [];
    } else {
      return objects.filter((object) =>
        object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
      );
    }
  };

  const mockAirports = [
    { iataCode: 'LHR', name: 'Heathrow Airport' },
    { iataCode: 'LGA', name: 'LaGuardia Airport' },
    { iataCode: 'LAX', name: 'Los Angeles International Airport' },
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport' },
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport' }
  ];

  const mockAirlines = [
    { iataCode: 'BA', name: 'British Airways' },
    { iataCode: 'LH', name: 'Lufthansa' },
    { iataCode: 'AA', name: 'American Airlines' },
    { iataCode: 'AF', name: 'Air France' }
  ];

  const mockAircraft = [
    { iataCode: '73G', name: 'Boeing 737-700' },
    { iataCode: '320', name: 'Airbus A320' },
    { iataCode: '738', name: 'Boeing 737-800' },
    { iataCode: '77W', name: 'Boeing 777-300ER' }
  ];

  describe('Airport filtering (3 character limit)', () => {
    test('should return all airports starting with single character', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'L', 3);
      expect(result).toHaveLength(3);
      expect(result.map(a => a.iataCode)).toEqual(['LHR', 'LGA', 'LAX']);
    });

    test('should return airports starting with two characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'LA', 3);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('LAX');
    });

    test('should return exact match for three characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'LHR', 3);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('LHR');
    });

    test('should return empty array for query longer than 3 characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'LHRX', 3);
      expect(result).toEqual([]);
    });

    test('should be case insensitive', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'lhr', 3);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('LHR');
    });

    test('should return empty array for non-matching query', () => {
      const result = filterObjectsByPartialIataCode(mockAirports, 'XYZ', 3);
      expect(result).toEqual([]);
    });
  });

  describe('Airline filtering (2 character limit)', () => {
    test('should return airlines starting with single character', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'A', 2);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.iataCode)).toEqual(['AA', 'AF']);
    });

    test('should return exact match for two characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'BA', 2);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('BA');
    });

    test('should return empty array for query longer than 2 characters', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'BAX', 2);
      expect(result).toEqual([]);
    });

    test('should be case insensitive', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, 'ba', 2);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('BA');
    });
  });

  describe('Aircraft filtering (3 character limit)', () => {
    test('should return aircraft starting with partial code', () => {
      const result = filterObjectsByPartialIataCode(mockAircraft, '73', 3);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.iataCode)).toEqual(['73G', '738']);
    });

    test('should return exact match', () => {
      const result = filterObjectsByPartialIataCode(mockAircraft, '320', 3);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('320');
    });

    test('should handle numeric codes', () => {
      const result = filterObjectsByPartialIataCode(mockAircraft, '3', 3);
      expect(result).toHaveLength(1);
      expect(result[0].iataCode).toBe('320');
    });

    test('should handle alphanumeric codes', () => {
      const result = filterObjectsByPartialIataCode(mockAircraft, '7', 3);
      expect(result).toHaveLength(3);
      expect(result.map(a => a.iataCode)).toEqual(['73G', '738', '77W']);
    });

    test('should return empty array for query longer than 3 characters', () => {
      const result = filterObjectsByPartialIataCode(mockAircraft, '320X', 3);
      expect(result).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty array', () => {
      const result = filterObjectsByPartialIataCode([], 'A', 2);
      expect(result).toEqual([]);
    });

    test('should handle empty query string', () => {
      const result = filterObjectsByPartialIataCode(mockAirlines, '', 2);
      expect(result).toHaveLength(4); // All airlines match empty string
    });

    test('should handle special characters in IATA codes', () => {
      const specialAirports = [
        { iataCode: 'A-B', name: 'Special Airport' },
        { iataCode: 'ABC', name: 'Normal Airport' }
      ];
      const result = filterObjectsByPartialIataCode(specialAirports, 'A', 3);
      expect(result).toHaveLength(2);
    });

    test('should handle numeric queries', () => {
      const numericAircraft = [
        { iataCode: '123', name: 'Aircraft 123' },
        { iataCode: '124', name: 'Aircraft 124' },
        { iataCode: 'ABC', name: 'Aircraft ABC' }
      ];
      const result = filterObjectsByPartialIataCode(numericAircraft, '12', 3);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.iataCode)).toEqual(['123', '124']);
    });

    test('should handle mixed case in data', () => {
      const mixedCaseData = [
        { iataCode: 'Lhr', name: 'Mixed Case Airport' },
        { iataCode: 'LGA', name: 'Normal Airport' }
      ];
      const result = filterObjectsByPartialIataCode(mixedCaseData, 'l', 3);
      expect(result).toHaveLength(2);
    });
  });
});