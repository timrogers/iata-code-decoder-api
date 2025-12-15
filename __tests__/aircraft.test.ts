import { AIRCRAFT } from '../src/aircraft.js';
import { Aircraft } from '../src/types.js';

describe('Aircraft Module', () => {
  describe('AIRCRAFT data', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRCRAFT)).toBe(true);
    });

    it('should contain aircraft objects', () => {
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should have aircraft with required fields', () => {
      const sampleAircraft = AIRCRAFT.find((a) => a.iataCode === '777');
      expect(sampleAircraft).toBeDefined();

      if (sampleAircraft) {
        expect(sampleAircraft.iataCode).toBe('777');
        expect(sampleAircraft.name).toBeDefined();
        expect(typeof sampleAircraft.name).toBe('string');
        expect(sampleAircraft.id).toBeDefined();
      }
    });

    it('should have camelCase property names', () => {
      const sampleAircraft = AIRCRAFT[0];

      // Check that camelCase properties exist
      expect(sampleAircraft).toHaveProperty('iataCode');
      expect(sampleAircraft).toHaveProperty('name');
      expect(sampleAircraft).toHaveProperty('id');

      // Original snake_case should not exist after conversion
      expect(sampleAircraft).not.toHaveProperty('iata_code');
    });

    it('should include well-known aircraft', () => {
      const wellKnownCodes = ['777', '320', '380', '737', '787'];

      wellKnownCodes.forEach((code) => {
        const aircraft = AIRCRAFT.find((a) => a.iataCode === code);
        expect(aircraft).toBeDefined();
        expect(aircraft?.iataCode).toBe(code);
      });
    });

    it('should have valid IATA codes (3 characters)', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft.iataCode).toBeDefined();
        expect(aircraft.iataCode.length).toBe(3);
        expect(aircraft.iataCode).toMatch(/^[A-Z0-9]{3}$/);
      });
    });

    it('should have unique IATA codes', () => {
      const codes = AIRCRAFT.map((a) => a.iataCode);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('Aircraft data transformation', () => {
    it('should correctly transform Boeing 777 data', () => {
      const b777 = AIRCRAFT.find((a) => a.iataCode === '777');
      expect(b777).toBeDefined();

      if (b777) {
        expect(b777.name).toContain('Boeing');
        expect(b777.name).toContain('777');
      }
    });

    it('should correctly transform Airbus A320 data', () => {
      const a320 = AIRCRAFT.find((a) => a.iataCode === '320');
      expect(a320).toBeDefined();

      if (a320) {
        expect(a320.name).toContain('Airbus');
        expect(a320.name).toContain('320');
      }
    });

    it('should correctly transform Boeing 787 data', () => {
      const b787 = AIRCRAFT.find((a) => a.iataCode === '787');
      expect(b787).toBeDefined();

      if (b787) {
        expect(b787.name).toContain('Boeing');
        expect(b787.name).toContain('787');
      }
    });

    it('should correctly transform Airbus A380 data', () => {
      const a380 = AIRCRAFT.find((a) => a.iataCode === '380');
      expect(a380).toBeDefined();

      if (a380) {
        expect(a380.name).toContain('Airbus');
        expect(a380.name).toContain('380');
      }
    });

    it('should correctly transform Boeing 737 data', () => {
      const b737 = AIRCRAFT.find((a) => a.iataCode === '737');
      expect(b737).toBeDefined();

      if (b737) {
        expect(b737.name).toContain('Boeing');
        expect(b737.name).toContain('737');
      }
    });
  });
});
