import { AIRLINES } from '../src/airlines.js';
import { Airline } from '../src/types.js';

describe('Airlines Module', () => {
  describe('AIRLINES data', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRLINES)).toBe(true);
    });

    it('should contain airline objects', () => {
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have airlines with required fields', () => {
      const sampleAirline = AIRLINES.find((a) => a.iataCode === 'BA');
      expect(sampleAirline).toBeDefined();

      if (sampleAirline) {
        expect(sampleAirline.iataCode).toBe('BA');
        expect(sampleAirline.name).toBeDefined();
        expect(typeof sampleAirline.name).toBe('string');
        expect(sampleAirline.id).toBeDefined();
      }
    });

    it('should have camelCase property names', () => {
      const sampleAirline = AIRLINES[0];

      // Check that camelCase properties exist
      expect(sampleAirline).toHaveProperty('iataCode');
      expect(sampleAirline).toHaveProperty('name');
      expect(sampleAirline).toHaveProperty('id');

      // Original snake_case should not exist after conversion
      expect(sampleAirline).not.toHaveProperty('iata_code');
    });

    it('should include well-known airlines', () => {
      const wellKnownCodes = ['BA', 'AA', 'UA', 'DL', 'LH', 'AF', 'EK'];

      wellKnownCodes.forEach((code) => {
        const airline = AIRLINES.find((a) => a.iataCode === code);
        expect(airline).toBeDefined();
        expect(airline?.iataCode).toBe(code);
      });
    });

    it('should have valid IATA codes (2 characters)', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode.length).toBe(2);
      });
    });

    it('should only include airlines with IATA codes (filter works)', () => {
      // All airlines should have an IATA code because the module filters them out
      AIRLINES.forEach((airline: Airline) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IATA codes', () => {
      const codes = AIRLINES.map((a) => a.iataCode);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('Airline data transformation', () => {
    it('should correctly transform British Airways data', () => {
      const ba = AIRLINES.find((a) => a.iataCode === 'BA');
      expect(ba).toBeDefined();

      if (ba) {
        expect(ba.name).toBe('British Airways');
      }
    });

    it('should correctly transform American Airlines data', () => {
      const aa = AIRLINES.find((a) => a.iataCode === 'AA');
      expect(aa).toBeDefined();

      if (aa) {
        expect(aa.name).toMatch(/American/);
      }
    });

    it('should correctly transform Emirates data', () => {
      const ek = AIRLINES.find((a) => a.iataCode === 'EK');
      expect(ek).toBeDefined();

      if (ek) {
        expect(ek.name).toBe('Emirates');
      }
    });

    it('should correctly transform Lufthansa data', () => {
      const lh = AIRLINES.find((a) => a.iataCode === 'LH');
      expect(lh).toBeDefined();

      if (lh) {
        expect(lh.name).toBe('Lufthansa');
      }
    });
  });

  describe('hasIataCode filter', () => {
    it('should not include any airlines without IATA codes', () => {
      const airlinesWithoutCode = AIRLINES.filter(
        (a) => !a.iataCode || a.iataCode === null || a.iataCode === '',
      );
      expect(airlinesWithoutCode.length).toBe(0);
    });
  });
});
