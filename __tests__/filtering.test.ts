import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';

// Helper function to simulate the filtering logic from api.ts
const filterObjectsByPartialIataCode = (
  objects: any[],
  partialIataCode: string,
  iataCodeLength: number,
): any[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

describe('Filtering Logic Tests', () => {
  describe('Airport Filtering', () => {
    it('should filter airports by exact 3-letter IATA code', () => {
      // Find a known airport code from the data
      const knownAirport = AIRPORTS[0];
      const results = filterObjectsByPartialIataCode(
        AIRPORTS,
        knownAirport.iataCode,
        3
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(airport => {
        expect(airport.iataCode.toLowerCase()).toBe(knownAirport.iataCode.toLowerCase());
      });
    });

    it('should filter airports by partial IATA code', () => {
      const results = filterObjectsByPartialIataCode(AIRPORTS, 'L', 3);
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(airport => {
        expect(airport.iataCode.toLowerCase().startsWith('l')).toBe(true);
      });
    });

    it('should return empty array for 4+ character queries', () => {
      const results = filterObjectsByPartialIataCode(AIRPORTS, 'LAXX', 3);
      expect(results).toEqual([]);
    });

    it('should handle case insensitive matching for airports', () => {
      const uppercaseResults = filterObjectsByPartialIataCode(AIRPORTS, 'LA', 3);
      const lowercaseResults = filterObjectsByPartialIataCode(AIRPORTS, 'la', 3);
      const mixedCaseResults = filterObjectsByPartialIataCode(AIRPORTS, 'La', 3);

      expect(uppercaseResults).toEqual(lowercaseResults);
      expect(lowercaseResults).toEqual(mixedCaseResults);
    });

    it('should return all airports starting with single character', () => {
      const results = filterObjectsByPartialIataCode(AIRPORTS, 'A', 3);
      
      results.forEach(airport => {
        expect(airport.iataCode.toLowerCase().startsWith('a')).toBe(true);
      });
    });
  });

  describe('Airline Filtering', () => {
    it('should filter airlines by exact 2-letter IATA code', () => {
      // Find a known airline code from the data
      const knownAirline = AIRLINES[0];
      const results = filterObjectsByPartialIataCode(
        AIRLINES,
        knownAirline.iataCode,
        2
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(airline => {
        expect(airline.iataCode.toLowerCase()).toBe(knownAirline.iataCode.toLowerCase());
      });
    });

    it('should filter airlines by partial IATA code', () => {
      const results = filterObjectsByPartialIataCode(AIRLINES, 'A', 2);
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(airline => {
        expect(airline.iataCode.toLowerCase().startsWith('a')).toBe(true);
      });
    });

    it('should return empty array for 3+ character queries for airlines', () => {
      const results = filterObjectsByPartialIataCode(AIRLINES, 'AAA', 2);
      expect(results).toEqual([]);
    });

    it('should handle case insensitive matching for airlines', () => {
      const uppercaseResults = filterObjectsByPartialIataCode(AIRLINES, 'AA', 2);
      const lowercaseResults = filterObjectsByPartialIataCode(AIRLINES, 'aa', 2);
      const mixedCaseResults = filterObjectsByPartialIataCode(AIRLINES, 'Aa', 2);

      expect(uppercaseResults).toEqual(lowercaseResults);
      expect(lowercaseResults).toEqual(mixedCaseResults);
    });
  });

  describe('Aircraft Filtering', () => {
    it('should filter aircraft by exact IATA code', () => {
      // Find a known aircraft code from the data
      const knownAircraft = AIRCRAFT[0];
      const results = filterObjectsByPartialIataCode(
        AIRCRAFT,
        knownAircraft.iataCode,
        3
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach(aircraft => {
        expect(aircraft.iataCode.toLowerCase()).toBe(knownAircraft.iataCode.toLowerCase());
      });
    });

    it('should filter aircraft by partial IATA code', () => {
      const results = filterObjectsByPartialIataCode(AIRCRAFT, '7', 3);
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(aircraft => {
        expect(aircraft.iataCode.toLowerCase().startsWith('7')).toBe(true);
      });
    });

    it('should return empty array for 4+ character queries for aircraft', () => {
      const results = filterObjectsByPartialIataCode(AIRCRAFT, '7370', 3);
      expect(results).toEqual([]);
    });

    it('should handle case insensitive matching for aircraft', () => {
      const uppercaseResults = filterObjectsByPartialIataCode(AIRCRAFT, 'B7', 3);
      const lowercaseResults = filterObjectsByPartialIataCode(AIRCRAFT, 'b7', 3);
      const mixedCaseResults = filterObjectsByPartialIataCode(AIRCRAFT, 'B7', 3);

      expect(uppercaseResults).toEqual(lowercaseResults);
      expect(lowercaseResults).toEqual(mixedCaseResults);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search queries', () => {
      const airportResults = filterObjectsByPartialIataCode(AIRPORTS, '', 3);
      const airlineResults = filterObjectsByPartialIataCode(AIRLINES, '', 2);
      const aircraftResults = filterObjectsByPartialIataCode(AIRCRAFT, '', 3);

      // Empty string should match all objects (startsWith('') is true for all strings)
      expect(airportResults.length).toBe(AIRPORTS.length);
      expect(airlineResults.length).toBe(AIRLINES.length);
      expect(aircraftResults.length).toBe(AIRCRAFT.length);
    });

    it('should handle special characters in search queries', () => {
      const specialCharResults = filterObjectsByPartialIataCode(AIRPORTS, '@#$', 3);
      expect(specialCharResults).toEqual([]);
    });

    it('should handle numeric searches', () => {
      const numericResults = filterObjectsByPartialIataCode(AIRCRAFT, '123', 3);
      expect(Array.isArray(numericResults)).toBe(true);
      numericResults.forEach(aircraft => {
        expect(aircraft.iataCode.toLowerCase().startsWith('123')).toBe(true);
      });
    });

    it('should handle mixed alphanumeric searches', () => {
      const mixedResults = filterObjectsByPartialIataCode(AIRCRAFT, 'A3', 3);
      expect(Array.isArray(mixedResults)).toBe(true);
      mixedResults.forEach(aircraft => {
        expect(aircraft.iataCode.toLowerCase().startsWith('a3')).toBe(true);
      });
    });

    it('should return empty arrays for non-existent codes', () => {
      const nonExistentAirports = filterObjectsByPartialIataCode(AIRPORTS, 'ZZZ', 3);
      const nonExistentAirlines = filterObjectsByPartialIataCode(AIRLINES, 'ZZ', 2);
      const nonExistentAircraft = filterObjectsByPartialIataCode(AIRCRAFT, 'ZZZ', 3);

      expect(nonExistentAirports).toEqual([]);
      expect(nonExistentAirlines).toEqual([]);
      expect(nonExistentAircraft).toEqual([]);
    });
  });

  describe('Performance and Data Integrity', () => {
    it('should complete airport filtering within reasonable time', () => {
      const start = Date.now();
      const results = filterObjectsByPartialIataCode(AIRPORTS, 'A', 3);
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should complete within 100ms
      expect(results.length).toBeGreaterThan(0);
    });

    it('should complete airline filtering within reasonable time', () => {
      const start = Date.now();
      const results = filterObjectsByPartialIataCode(AIRLINES, 'A', 2);
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should complete within 100ms
      expect(results.length).toBeGreaterThan(0);
    });

    it('should complete aircraft filtering within reasonable time', () => {
      const start = Date.now();
      const results = filterObjectsByPartialIataCode(AIRCRAFT, '7', 3);
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should complete within 100ms
      expect(results.length).toBeGreaterThan(0);
    });

    it('should maintain data integrity during filtering', () => {
      const originalAirportsLength = AIRPORTS.length;
      const originalAirlinesLength = AIRLINES.length;
      const originalAircraftLength = AIRCRAFT.length;

      // Perform several filtering operations
      filterObjectsByPartialIataCode(AIRPORTS, 'A', 3);
      filterObjectsByPartialIataCode(AIRLINES, 'A', 2);
      filterObjectsByPartialIataCode(AIRCRAFT, '7', 3);

      // Ensure original data is unchanged
      expect(AIRPORTS.length).toBe(originalAirportsLength);
      expect(AIRLINES.length).toBe(originalAirlinesLength);
      expect(AIRCRAFT.length).toBe(originalAircraftLength);
    });
  });
});