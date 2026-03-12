import { AIRPORTS } from '../src/airports.js';

describe('airports', () => {
  describe('AIRPORTS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should have airports with camelCase keys', () => {
      const airport = AIRPORTS[0];
      expect(airport).toHaveProperty('iataCode');
      expect(airport).toHaveProperty('name');
      expect(airport).toHaveProperty('cityName');
      expect(airport).toHaveProperty('iataCountryCode');
      expect(airport).toHaveProperty('id');
      expect(airport).toHaveProperty('timeZone');
      expect(airport).toHaveProperty('latitude');
      expect(airport).toHaveProperty('longitude');
    });

    it('should not have snake_case keys on airports', () => {
      const airport = AIRPORTS[0];
      expect(airport).not.toHaveProperty('iata_code');
      expect(airport).not.toHaveProperty('city_name');
      expect(airport).not.toHaveProperty('iata_country_code');
      expect(airport).not.toHaveProperty('time_zone');
      expect(airport).not.toHaveProperty('icao_code');
      expect(airport).not.toHaveProperty('iata_city_code');
    });

    it('should have string IATA codes on all airports', () => {
      AIRPORTS.forEach((airport) => {
        expect(typeof airport.iataCode).toBe('string');
        expect(airport.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should have airports with city data camelised', () => {
      const airportWithCity = AIRPORTS.find((a) => a.city !== null);
      expect(airportWithCity).toBeDefined();

      if (airportWithCity && airportWithCity.city) {
        expect(airportWithCity.city).toHaveProperty('iataCode');
        expect(airportWithCity.city).toHaveProperty('name');
        expect(airportWithCity.city).toHaveProperty('id');
        expect(airportWithCity.city).toHaveProperty('iataCountryCode');
        // Should not have snake_case keys
        expect(airportWithCity.city).not.toHaveProperty('iata_code');
        expect(airportWithCity.city).not.toHaveProperty('iata_country_code');
      }
    });

    it('should have airports with null city', () => {
      const airportWithoutCity = AIRPORTS.find((a) => a.city === null);
      expect(airportWithoutCity).toBeDefined();
      expect(airportWithoutCity!.city).toBeNull();
    });

    it('should have numeric latitude and longitude', () => {
      AIRPORTS.forEach((airport) => {
        expect(typeof airport.latitude).toBe('number');
        expect(typeof airport.longitude).toBe('number');
      });
    });
  });
});
