import { AIRLINES } from '../src/airlines.js';

describe('Airlines - Unit Tests', () => {
  describe('AIRLINES data structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRLINES)).toBe(true);
    });

    it('should contain airline objects with required properties', () => {
      expect(AIRLINES.length).toBeGreaterThan(0);

      const firstAirline = AIRLINES[0];
      expect(firstAirline).toHaveProperty('id');
      expect(firstAirline).toHaveProperty('name');
      expect(firstAirline).toHaveProperty('iataCode');
    });

    it('should only include airlines with valid IATA codes', () => {
      AIRLINES.forEach((airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(typeof airline.iataCode).toBe('string');
        expect(airline.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should have camelCased property names', () => {
      const firstAirline = AIRLINES[0];
      expect(firstAirline).toHaveProperty('iataCode');
      expect(firstAirline).not.toHaveProperty('iata_code');
    });

    it('should have all required airline properties with correct types', () => {
      AIRLINES.forEach((airline) => {
        expect(typeof airline.id).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.iataCode).toBe('string');
      });
    });

    it('should filter out airlines without IATA codes', () => {
      // This test verifies the hasIataCode filter is working
      const airlinesWithoutIataCode = AIRLINES.filter(
        (airline) => !airline.iataCode || airline.iataCode === '',
      );
      expect(airlinesWithoutIataCode.length).toBe(0);
    });

    it('should contain commonly known airlines', () => {
      const iataCodesList = AIRLINES.map((a) => a.iataCode);

      // Test for some well-known airlines
      const knownAirlines = ['BA', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'];
      const foundAirlines = knownAirlines.filter((code) => iataCodesList.includes(code));

      // At least some of these should exist
      expect(foundAirlines.length).toBeGreaterThan(0);
    });

    it('should have IATA codes with typical length (2 characters)', () => {
      // Most IATA airline codes should be 2 characters
      const twoCharCodes = AIRLINES.filter((airline) => airline.iataCode.length === 2);
      expect(twoCharCodes.length).toBeGreaterThan(0);

      // Most should be 2 characters (allowing for some exceptions)
      expect(twoCharCodes.length / AIRLINES.length).toBeGreaterThan(0.8);
    });
  });
});
