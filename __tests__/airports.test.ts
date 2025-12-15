import { AIRPORTS } from '../src/airports.js';
import { Airport } from '../src/types.js';

describe('Airports Module', () => {
  describe('AIRPORTS data', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRPORTS)).toBe(true);
    });

    it('should contain airport objects', () => {
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should have airports with required fields', () => {
      const sampleAirport = AIRPORTS.find((a) => a.iataCode === 'LHR');
      expect(sampleAirport).toBeDefined();

      if (sampleAirport) {
        expect(sampleAirport.iataCode).toBe('LHR');
        expect(sampleAirport.name).toBeDefined();
        expect(typeof sampleAirport.name).toBe('string');
        expect(sampleAirport.id).toBeDefined();
        expect(typeof sampleAirport.latitude).toBe('number');
        expect(typeof sampleAirport.longitude).toBe('number');
      }
    });

    it('should have camelCase property names', () => {
      const sampleAirport = AIRPORTS[0];

      // Check that snake_case properties have been converted
      expect(sampleAirport).toHaveProperty('iataCode');
      expect(sampleAirport).toHaveProperty('cityName');

      // Original snake_case should not exist after conversion
      expect(sampleAirport).not.toHaveProperty('iata_code');
      expect(sampleAirport).not.toHaveProperty('city_name');
    });

    it('should include well-known airports', () => {
      const wellKnownCodes = ['LHR', 'JFK', 'LAX', 'CDG', 'DXB', 'SIN', 'HKG'];

      wellKnownCodes.forEach((code) => {
        const airport = AIRPORTS.find((a) => a.iataCode === code);
        expect(airport).toBeDefined();
        expect(airport?.iataCode).toBe(code);
      });
    });

    it('should have valid IATA codes (3 characters)', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(airport.iataCode).toBeDefined();
        expect(airport.iataCode.length).toBe(3);
        expect(airport.iataCode).toMatch(/^[A-Z0-9]{3}$/);
      });
    });

    it('should have valid latitude values (-90 to 90)', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(airport.latitude).toBeGreaterThanOrEqual(-90);
        expect(airport.latitude).toBeLessThanOrEqual(90);
      });
    });

    it('should have valid longitude values (-180 to 180)', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(airport.longitude).toBeGreaterThanOrEqual(-180);
        expect(airport.longitude).toBeLessThanOrEqual(180);
      });
    });

    it('should have properly transformed nested city object when present', () => {
      // Find an airport with a city object
      const airportWithCity = AIRPORTS.find(
        (a) => a.city !== null && a.city !== undefined,
      );

      if (airportWithCity && airportWithCity.city) {
        expect(airportWithCity.city).toHaveProperty('iataCode');
        expect(airportWithCity.city).toHaveProperty('iataCountryCode');
        expect(airportWithCity.city).toHaveProperty('name');
        expect(airportWithCity.city).toHaveProperty('id');

        // Should not have snake_case keys
        expect(airportWithCity.city).not.toHaveProperty('iata_code');
        expect(airportWithCity.city).not.toHaveProperty('iata_country_code');
      }
    });

    it('should have unique IATA codes', () => {
      const codes = AIRPORTS.map((a) => a.iataCode);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('Airport data transformation', () => {
    it('should correctly transform LHR airport data', () => {
      const lhr = AIRPORTS.find((a) => a.iataCode === 'LHR');
      expect(lhr).toBeDefined();

      if (lhr) {
        expect(lhr.name).toContain('Heathrow');
        expect(lhr.iataCountryCode).toBe('GB');
        expect(lhr.icaoCode).toBe('EGLL');
      }
    });

    it('should correctly transform JFK airport data', () => {
      const jfk = AIRPORTS.find((a) => a.iataCode === 'JFK');
      expect(jfk).toBeDefined();

      if (jfk) {
        expect(jfk.name).toContain('Kennedy');
        expect(jfk.iataCountryCode).toBe('US');
      }
    });
  });
});
