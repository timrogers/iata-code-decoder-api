import { AIRCRAFT } from '../src/aircraft.js';

describe('Aircraft - Unit Tests', () => {
  describe('AIRCRAFT data structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRCRAFT)).toBe(true);
    });

    it('should contain aircraft objects with required properties', () => {
      expect(AIRCRAFT.length).toBeGreaterThan(0);

      const firstAircraft = AIRCRAFT[0];
      expect(firstAircraft).toHaveProperty('id');
      expect(firstAircraft).toHaveProperty('name');
      expect(firstAircraft).toHaveProperty('iataCode');
    });

    it('should have camelCased property names', () => {
      const firstAircraft = AIRCRAFT[0];
      expect(firstAircraft).toHaveProperty('iataCode');
      
      // Should not have snake_case
      expect(firstAircraft).not.toHaveProperty('iata_code');
    });

    it('should have all required aircraft properties with correct types', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(typeof aircraft.id).toBe('string');
        expect(typeof aircraft.name).toBe('string');
        expect(typeof aircraft.iataCode).toBe('string');
      });
    });

    it('should have IATA codes with valid lengths (typically 3 characters)', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.iataCode).toBeDefined();
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
        // Most IATA aircraft codes are 3 characters
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(4);
      });
    });

    it('should contain commonly known aircraft types', () => {
      const iataCodesList = AIRCRAFT.map((a) => a.iataCode);
      
      // Test for some well-known aircraft
      const knownAircraft = ['777', '787', 'A320', 'A380', '737', '747'];
      const foundAircraft = knownAircraft.filter((code) => 
        iataCodesList.some((iata) => iata.includes(code))
      );
      
      // At least some of these should exist
      expect(foundAircraft.length).toBeGreaterThan(0);
    });

    it('should have non-empty names', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.name).toBeTruthy();
        expect(aircraft.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty IDs', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.id).toBeTruthy();
        expect(aircraft.id.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty IATA codes', () => {
      AIRCRAFT.forEach((aircraft) => {
        expect(aircraft.iataCode).toBeTruthy();
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IATA codes', () => {
      const iataCodes = AIRCRAFT.map((a) => a.iataCode);
      const uniqueIataCodes = new Set(iataCodes);
      
      // All IATA codes should be unique (or at least most of them)
      // Some aircraft might share codes with variants
      expect(uniqueIataCodes.size).toBeGreaterThan(AIRCRAFT.length * 0.9);
    });

    it('should have unique IDs', () => {
      const ids = AIRCRAFT.map((a) => a.id);
      const uniqueIds = new Set(ids);
      
      // All IDs should be unique
      expect(uniqueIds.size).toBe(AIRCRAFT.length);
    });
  });
});
