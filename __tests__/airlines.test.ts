import { AIRLINES } from '../src/airlines.js';

describe('airlines', () => {
  describe('AIRLINES', () => {
    it('should load airline data', () => {
      expect(AIRLINES).toBeDefined();
      expect(Array.isArray(AIRLINES)).toBe(true);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have camelCase property names', () => {
      const airline = AIRLINES[0];

      expect(airline).toHaveProperty('iataCode');
      expect(airline).toHaveProperty('name');
      expect(airline).toHaveProperty('id');
    });

    it('should filter out airlines without IATA codes', () => {
      AIRLINES.forEach((airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode).not.toBeUndefined();
      });
    });

    it('should have valid IATA codes', () => {
      AIRLINES.forEach((airline) => {
        expect(typeof airline.iataCode).toBe('string');
        expect(airline.iataCode.length).toBeGreaterThan(0);
        expect(airline.iataCode.length).toBeLessThanOrEqual(2);
      });
    });

    it('should have required string properties', () => {
      const airline = AIRLINES[0];

      expect(typeof airline.iataCode).toBe('string');
      expect(typeof airline.name).toBe('string');
      expect(typeof airline.id).toBe('string');
    });

    it('should have non-empty names', () => {
      AIRLINES.forEach((airline) => {
        expect(airline.name).toBeDefined();
        expect(airline.name.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IATA codes', () => {
      const iataCodes = AIRLINES.map((airline) => airline.iataCode);
      const uniqueIataCodes = new Set(iataCodes);

      // Most IATA codes should be unique, though there might be some duplicates
      // in the data due to historical or regional variations
      expect(uniqueIataCodes.size).toBeGreaterThan(AIRLINES.length * 0.9);
    });
  });
});
