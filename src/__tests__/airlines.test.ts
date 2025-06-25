import { AIRLINES } from '../airlines.js';
import { Airline } from '../types.js';

// Mock the JSON data to avoid loading large files in tests
jest.mock('../../data/airlines.json', () => [
  {
    id: 'american_airlines',
    name: 'American Airlines',
    iata_code: 'AA',
  },
  {
    id: 'delta_airlines',
    name: 'Delta Air Lines',
    iata_code: 'DL',
  },
  {
    id: 'united_airlines',
    name: 'United Airlines',
    iata_code: 'UA',
  },
  {
    id: 'no_iata_airline',
    name: 'No IATA Airline',
    iata_code: null,
  },
  {
    id: 'empty_iata_airline',
    name: 'Empty IATA Airline',
    iata_code: '',
  },
  {
    id: 'undefined_iata_airline',
    name: 'Undefined IATA Airline',
    // iata_code is undefined (missing property)
  },
], { virtual: true });

describe('Airlines', () => {
  describe('AIRLINES export', () => {
    it('should export an array of airlines', () => {
      expect(Array.isArray(AIRLINES)).toBe(true);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have properly camelized keys for all airlines', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline).toHaveProperty('id');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('iataCode');

        // Should not have snake_case keys
        expect(airline).not.toHaveProperty('iata_code');
      });
    });

    it('should filter out airlines without IATA codes', () => {
      // Check that all airlines in the final array have valid IATA codes
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode).not.toBe('');
        expect(typeof airline.iataCode).toBe('string');
      });

      // Verify we have exactly the 3 airlines with valid IATA codes
      expect(AIRLINES).toHaveLength(3);
    });

    it('should include airlines with valid IATA codes', () => {
      const americanAirlines = AIRLINES.find(airline => airline.iataCode === 'AA');
      const deltaAirlines = AIRLINES.find(airline => airline.iataCode === 'DL');
      const unitedAirlines = AIRLINES.find(airline => airline.iataCode === 'UA');

      expect(americanAirlines).toBeDefined();
      expect(americanAirlines?.name).toBe('American Airlines');
      expect(americanAirlines?.id).toBe('american_airlines');

      expect(deltaAirlines).toBeDefined();
      expect(deltaAirlines?.name).toBe('Delta Air Lines');
      expect(deltaAirlines?.id).toBe('delta_airlines');

      expect(unitedAirlines).toBeDefined();
      expect(unitedAirlines?.name).toBe('United Airlines');
      expect(unitedAirlines?.id).toBe('united_airlines');
    });

    it('should exclude airlines with null IATA codes', () => {
      const noIataAirline = AIRLINES.find(airline => airline.name === 'No IATA Airline');
      expect(noIataAirline).toBeUndefined();
    });

    it('should exclude airlines with empty IATA codes', () => {
      const emptyIataAirline = AIRLINES.find(airline => airline.name === 'Empty IATA Airline');
      expect(emptyIataAirline).toBeUndefined();
    });

    it('should exclude airlines with undefined IATA codes', () => {
      const undefinedIataAirline = AIRLINES.find(airline => airline.name === 'Undefined IATA Airline');
      expect(undefinedIataAirline).toBeUndefined();
    });

    it('should maintain correct data types', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(typeof airline.id).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.iataCode).toBe('string');
      });
    });

    it('should have valid IATA codes format', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.iataCode.length).toBe(2);
        expect(airline.iataCode).toMatch(/^[A-Z0-9]+$/);
      });
    });

    it('should have unique IATA codes', () => {
      const iataCodes = AIRLINES.map(airline => airline.iataCode);
      const uniqueIataCodes = [...new Set(iataCodes)];
      expect(iataCodes).toHaveLength(uniqueIataCodes.length);
    });

    it('should have unique IDs', () => {
      const ids = AIRLINES.map(airline => airline.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('should have non-empty names', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.name).toBeTruthy();
        expect(airline.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty IDs', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.id).toBeTruthy();
        expect(airline.id.length).toBeGreaterThan(0);
      });
    });
  });
});