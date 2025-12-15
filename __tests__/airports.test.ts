import { AIRPORTS } from '../src/airports.js';
import { Airport } from '../src/types.js';

describe('airports', () => {
  describe('AIRPORTS', () => {
    it('should load airport data', () => {
      expect(AIRPORTS).toBeDefined();
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should have camelCase property names', () => {
      const airport = AIRPORTS[0];

      expect(airport).toHaveProperty('iataCode');
      expect(airport).toHaveProperty('name');
      expect(airport).toHaveProperty('cityName');
      expect(airport).toHaveProperty('icaoCode');
      // Note: time_zone is converted to timeZone by cameliseKeys
      expect(airport).toHaveProperty('timeZone');
      expect(airport).toHaveProperty('latitude');
      expect(airport).toHaveProperty('longitude');
      expect(airport).toHaveProperty('iataCountryCode');
    });

    it('should have valid IATA codes', () => {
      AIRPORTS.forEach((airport) => {
        expect(airport.iataCode).toBeDefined();
        expect(typeof airport.iataCode).toBe('string');
        expect(airport.iataCode.length).toBeGreaterThan(0);
        expect(airport.iataCode.length).toBeLessThanOrEqual(3);
      });
    });

    it('should have required string properties', () => {
      const airport = AIRPORTS[0] as Airport & { timeZone: string };

      expect(typeof airport.iataCode).toBe('string');
      expect(typeof airport.name).toBe('string');
      expect(typeof airport.cityName).toBe('string');
      // Note: time_zone is converted to timeZone by cameliseKeys, but the type definition hasn't been updated
      expect(typeof airport.timeZone).toBe('string');
      expect(typeof airport.iataCountryCode).toBe('string');
    });

    it('should have valid coordinate properties', () => {
      const airport = AIRPORTS[0];

      expect(typeof airport.latitude).toBe('number');
      expect(typeof airport.longitude).toBe('number');
      expect(airport.latitude).toBeGreaterThanOrEqual(-90);
      expect(airport.latitude).toBeLessThanOrEqual(90);
      expect(airport.longitude).toBeGreaterThanOrEqual(-180);
      expect(airport.longitude).toBeLessThanOrEqual(180);
    });

    it('should transform city data to camelCase when present', () => {
      const airportsWithCity = AIRPORTS.filter((airport) => airport.city !== null);

      expect(airportsWithCity.length).toBeGreaterThan(0);

      const airportWithCity = airportsWithCity[0];
      if (airportWithCity.city) {
        expect(airportWithCity.city).toHaveProperty('name');
        expect(airportWithCity.city).toHaveProperty('iataCode');
        expect(airportWithCity.city).toHaveProperty('iataCountryCode');
      }
    });

    it('should handle airports without city data', () => {
      const airportsWithoutCity = AIRPORTS.filter((airport) => airport.city === null);

      // Some airports may not have city data, this should be handled gracefully
      airportsWithoutCity.forEach((airport) => {
        expect(airport.city).toBeNull();
        expect(airport.cityName).toBeDefined();
      });
    });
  });
});
