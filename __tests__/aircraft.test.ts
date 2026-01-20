import { AIRCRAFT } from '../src/aircraft.js';

describe('aircraft', () => {
  describe('AIRCRAFT', () => {
    it('should load aircraft data', () => {
      expect(AIRCRAFT).toBeDefined();
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should have camelCase property names', () => {
      const aircraft = AIRCRAFT[0];

      expect(aircraft).toHaveProperty('iataCode');
      expect(aircraft).toHaveProperty('name');
      expect(aircraft).toHaveProperty('id');
    });

    it('should have valid IATA codes', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.iataCode).toBeDefined();
        expect(typeof aircraft.iataCode).toBe('string');
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(3);
      });
    });

    it('should have required string properties', () => {
      const aircraft = AIRCRAFT[0];

      expect(typeof aircraft.iataCode).toBe('string');
      expect(typeof aircraft.name).toBe('string');
      expect(typeof aircraft.id).toBe('string');
    });

    it('should have non-empty names', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.name).toBeDefined();
        expect(aircraft.name.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IATA codes', () => {
      const iataCodes = AIRCRAFT.map((aircraft) => aircraft.iataCode);
      const uniqueIataCodes = new Set(iataCodes);

      // IATA codes should be mostly unique
      expect(uniqueIataCodes.size).toBeGreaterThan(AIRCRAFT.length * 0.9);
    });
  });
});
