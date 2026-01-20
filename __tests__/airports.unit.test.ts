import { AIRPORTS } from '../src/airports.js';

describe('Airports - Unit Tests', () => {
  describe('AIRPORTS data structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(AIRPORTS)).toBe(true);
    });

    it('should contain airport objects with required properties', () => {
      expect(AIRPORTS.length).toBeGreaterThan(0);

      const firstAirport = AIRPORTS[0];
      expect(firstAirport).toHaveProperty('id');
      expect(firstAirport).toHaveProperty('name');
      expect(firstAirport).toHaveProperty('iataCode');
      expect(firstAirport).toHaveProperty('icaoCode');
      expect(firstAirport).toHaveProperty('latitude');
      expect(firstAirport).toHaveProperty('longitude');
      expect(firstAirport).toHaveProperty('cityName');
    });

    it('should have camelCased property names', () => {
      const firstAirport = AIRPORTS[0];
      expect(firstAirport).toHaveProperty('iataCode');
      expect(firstAirport).toHaveProperty('icaoCode');
      expect(firstAirport).toHaveProperty('iataCountryCode');
      expect(firstAirport).toHaveProperty('cityName');
      
      // Should not have snake_case
      expect(firstAirport).not.toHaveProperty('iata_code');
      expect(firstAirport).not.toHaveProperty('icao_code');
      expect(firstAirport).not.toHaveProperty('iata_country_code');
      expect(firstAirport).not.toHaveProperty('city_name');
    });

    it('should have all required airport properties with correct types', () => {
      AIRPORTS.forEach((airport) => {
        expect(typeof airport.id).toBe('string');
        expect(typeof airport.name).toBe('string');
        expect(typeof airport.iataCode).toBe('string');
        // icaoCode can be null or string
        expect(['string', 'object'].includes(typeof airport.icaoCode)).toBe(true);
        if (airport.icaoCode !== null) {
          expect(typeof airport.icaoCode).toBe('string');
        }
        expect(typeof airport.iataCountryCode).toBe('string');
        expect(typeof airport.cityName).toBe('string');
        expect(typeof airport.latitude).toBe('number');
        expect(typeof airport.longitude).toBe('number');
      });
    });

    it('should have IATA codes with standard length (3 characters)', () => {
      AIRPORTS.forEach((airport) => {
        expect(airport.iataCode).toBeDefined();
        expect(airport.iataCode.length).toBe(3);
      });
    });

    it('should have valid latitude values', () => {
      AIRPORTS.forEach((airport) => {
        expect(airport.latitude).toBeGreaterThanOrEqual(-90);
        expect(airport.latitude).toBeLessThanOrEqual(90);
      });
    });

    it('should have valid longitude values', () => {
      AIRPORTS.forEach((airport) => {
        expect(airport.longitude).toBeGreaterThanOrEqual(-180);
        expect(airport.longitude).toBeLessThanOrEqual(180);
      });
    });

    it('should contain commonly known airports', () => {
      const iataCodesList = AIRPORTS.map((a) => a.iataCode);
      
      // Test for some well-known airports
      const knownAirports = ['LHR', 'JFK', 'LAX', 'CDG', 'DXB', 'SYD'];
      const foundAirports = knownAirports.filter((code) => iataCodesList.includes(code));
      
      // At least some of these should exist
      expect(foundAirports.length).toBeGreaterThan(0);
    });

    it('should handle city data transformation', () => {
      // Find an airport with city data
      const airportWithCity = AIRPORTS.find((airport) => airport.city !== null);
      
      if (airportWithCity && airportWithCity.city) {
        // City should have camelCased properties
        expect(airportWithCity.city).toHaveProperty('name');
        expect(airportWithCity.city).toHaveProperty('iataCode');
        expect(airportWithCity.city).toHaveProperty('iataCountryCode');
        
        // Should not have snake_case
        expect(airportWithCity.city).not.toHaveProperty('iata_code');
        expect(airportWithCity.city).not.toHaveProperty('iata_country_code');
      }
    });

    it('should allow null city values', () => {
      // Some airports might not have city data
      const airportsWithNullCity = AIRPORTS.filter((airport) => airport.city === null);
      
      // It's valid for some airports to have null city
      expect(airportsWithNullCity.length).toBeGreaterThanOrEqual(0);
    });

    it('should have ICAO codes with standard length (4 characters)', () => {
      AIRPORTS.forEach((airport) => {
        if (airport.icaoCode) {
          // ICAO codes should be 4 characters when present
          expect(airport.icaoCode.length).toBe(4);
        }
      });
    });

    it('should have country codes with standard length (2 characters)', () => {
      AIRPORTS.forEach((airport) => {
        expect(airport.iataCountryCode.length).toBe(2);
      });
    });
  });
});
