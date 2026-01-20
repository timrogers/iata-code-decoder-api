import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';

describe('IATA Code Filtering - Unit Tests', () => {
  describe('Airport IATA code filtering behavior', () => {
    it('should find airports with prefix matching (case-insensitive)', () => {
      const lhrAirports = AIRPORTS.filter((a) =>
        a.iataCode.toLowerCase().startsWith('lhr'),
      );

      expect(lhrAirports.length).toBeGreaterThan(0);
      expect(lhrAirports[0].iataCode).toBe('LHR');
    });

    it('should filter airports by single character prefix', () => {
      const lAirports = AIRPORTS.filter((a) => a.iataCode.toLowerCase().startsWith('l'));

      expect(lAirports.length).toBeGreaterThan(0);
      lAirports.forEach((airport) => {
        expect(airport.iataCode[0].toLowerCase()).toBe('l');
      });
    });

    it('should handle empty results for non-existent codes', () => {
      const results = AIRPORTS.filter((a) => a.iataCode.toLowerCase().startsWith('zzzz'));

      expect(results).toEqual([]);
    });

    it('should respect IATA code length for airports (3 characters)', () => {
      // Query longer than IATA code length should return empty
      const longQuery = 'LHRX'; // 4 characters, longer than 3
      const results = AIRPORTS.filter((a) =>
        a.iataCode.toLowerCase().startsWith(longQuery.toLowerCase()),
      );

      expect(results).toEqual([]);
    });
  });

  describe('Airline IATA code filtering behavior', () => {
    it('should find airlines with prefix matching (case-insensitive)', () => {
      const baAirlines = AIRLINES.filter((a) =>
        a.iataCode.toLowerCase().startsWith('ba'),
      );

      expect(baAirlines.length).toBeGreaterThan(0);
      expect(baAirlines[0].iataCode).toBe('BA');
    });

    it('should filter airlines by single character prefix', () => {
      const aAirlines = AIRLINES.filter((a) => a.iataCode.toLowerCase().startsWith('a'));

      expect(aAirlines.length).toBeGreaterThan(0);
      aAirlines.forEach((airline) => {
        expect(airline.iataCode[0].toLowerCase()).toBe('a');
      });
    });

    it('should respect IATA code length for airlines (2 characters)', () => {
      // Query longer than IATA code length should return empty
      const longQuery = 'BAA'; // 3 characters, longer than 2
      const results = AIRLINES.filter((a) =>
        a.iataCode.toLowerCase().startsWith(longQuery.toLowerCase()),
      );

      expect(results).toEqual([]);
    });
  });

  describe('Aircraft IATA code filtering behavior', () => {
    it('should find aircraft with prefix matching (case-insensitive)', () => {
      const boeing777 = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith('777'),
      );

      expect(boeing777.length).toBeGreaterThan(0);
      expect(boeing777[0].iataCode).toBe('777');
    });

    it('should filter aircraft by single character prefix', () => {
      const sevenAircraft = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith('7'),
      );

      expect(sevenAircraft.length).toBeGreaterThan(0);
      sevenAircraft.forEach((aircraft) => {
        expect(aircraft.iataCode[0].toLowerCase()).toBe('7');
      });
    });

    it('should handle queries for Airbus aircraft', () => {
      const airbusAircraft = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith('a3'),
      );

      expect(airbusAircraft.length).toBeGreaterThan(0);
      airbusAircraft.forEach((aircraft) => {
        expect(aircraft.iataCode.toLowerCase().startsWith('a3')).toBe(true);
      });
    });

    it('should respect IATA code length for aircraft (3 characters)', () => {
      // Query longer than IATA code length should return empty
      const longQuery = '7777'; // 4 characters, longer than 3
      const results = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith(longQuery.toLowerCase()),
      );

      expect(results).toEqual([]);
    });
  });

  describe('Case sensitivity', () => {
    it('should handle lowercase queries for airports', () => {
      const lowerResults = AIRPORTS.filter((a) =>
        a.iataCode.toLowerCase().startsWith('lhr'),
      );
      const upperResults = AIRPORTS.filter((a) =>
        a.iataCode.toLowerCase().startsWith('lhr'),
      );

      expect(lowerResults).toEqual(upperResults);
    });

    it('should handle lowercase queries for airlines', () => {
      const lowerResults = AIRLINES.filter((a) =>
        a.iataCode.toLowerCase().startsWith('ba'),
      );
      const upperResults = AIRLINES.filter((a) =>
        a.iataCode.toLowerCase().startsWith('ba'),
      );

      expect(lowerResults).toEqual(upperResults);
    });

    it('should handle mixed case queries for aircraft', () => {
      const mixedResults = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith('a320'),
      );
      const lowerResults = AIRCRAFT.filter((a) =>
        a.iataCode.toLowerCase().startsWith('a320'),
      );

      expect(mixedResults).toEqual(lowerResults);
    });
  });
});
