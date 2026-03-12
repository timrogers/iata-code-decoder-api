import { AIRLINES } from '../src/airlines.js';

describe('airlines', () => {
  describe('AIRLINES', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(AIRLINES)).toBe(true);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have airlines with camelCase keys', () => {
      const airline = AIRLINES[0];
      expect(airline).toHaveProperty('iataCode');
      expect(airline).toHaveProperty('name');
      expect(airline).toHaveProperty('id');
    });

    it('should not have snake_case keys on airlines', () => {
      const airline = AIRLINES[0];
      expect(airline).not.toHaveProperty('iata_code');
    });

    it('should only contain airlines with an IATA code', () => {
      AIRLINES.forEach((airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(typeof airline.iataCode).toBe('string');
      });
    });

    it('should have filtered out airlines without IATA codes', () => {
      // The raw data has airlines with null iata_code; these should be filtered out
      const airlinesWithNullCode = AIRLINES.filter(
        (airline) => airline.iataCode === null || airline.iataCode === undefined,
      );
      expect(airlinesWithNullCode.length).toBe(0);
    });

    it('should have string names on all airlines', () => {
      AIRLINES.forEach((airline) => {
        expect(typeof airline.name).toBe('string');
        expect(airline.name.length).toBeGreaterThan(0);
      });
    });

    it('should have string ids on all airlines', () => {
      AIRLINES.forEach((airline) => {
        expect(typeof airline.id).toBe('string');
        expect(airline.id.length).toBeGreaterThan(0);
      });
    });
  });
});
