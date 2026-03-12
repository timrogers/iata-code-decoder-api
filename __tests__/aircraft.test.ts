import { AIRCRAFT } from '../src/aircraft.js';

describe('aircraft', () => {
  describe('AIRCRAFT', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should have aircraft with camelCase keys', () => {
      const aircraft = AIRCRAFT[0];
      expect(aircraft).toHaveProperty('iataCode');
      expect(aircraft).toHaveProperty('name');
      expect(aircraft).toHaveProperty('id');
    });

    it('should not have snake_case keys on aircraft', () => {
      const aircraft = AIRCRAFT[0];
      expect(aircraft).not.toHaveProperty('iata_code');
    });

    it('should have string IATA codes on all aircraft', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(typeof aircraft.iataCode).toBe('string');
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should have string names on all aircraft', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(typeof aircraft.name).toBe('string');
        expect(aircraft.name.length).toBeGreaterThan(0);
      });
    });

    it('should have string ids on all aircraft', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(typeof aircraft.id).toBe('string');
        expect(aircraft.id.length).toBeGreaterThan(0);
      });
    });
  });
});
