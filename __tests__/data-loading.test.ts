import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';
import { Airport, Airline, Aircraft } from '../src/types.js';

describe('Data Loading Tests', () => {
  describe('Airports Data Loading', () => {
    it('should load airports data successfully', () => {
      expect(AIRPORTS).toBeDefined();
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should have properly structured airport objects', () => {
      const airport = AIRPORTS[0];
      expect(airport).toHaveProperty('iataCode');
      expect(airport).toHaveProperty('name');
      expect(airport).toHaveProperty('id');
      expect(airport).toHaveProperty('icaoCode');
      expect(airport).toHaveProperty('iataCountryCode');
      expect(airport).toHaveProperty('cityName');
      expect(airport).toHaveProperty('latitude');
      expect(airport).toHaveProperty('longitude');
      expect(airport).toHaveProperty('timeZone');
    });

    it('should have camelCase property names for airports', () => {
      const airport = AIRPORTS[0];
      // These should be camelCase after transformation
      expect(airport).toHaveProperty('time_zone');
      expect(airport).toHaveProperty('cityName');
      expect(airport).toHaveProperty('iataCode');
      expect(airport).toHaveProperty('icaoCode');
      expect(airport).toHaveProperty('iataCountryCode');
      
      // These should NOT exist (snake_case versions) - except time_zone which is still snake_case in the type
      expect(airport).not.toHaveProperty('city_name');
      expect(airport).not.toHaveProperty('iata_code');
      expect(airport).not.toHaveProperty('icao_code');
      expect(airport).not.toHaveProperty('iata_country_code');
    });

    it('should handle airports with and without city objects', () => {
      const airportsWithCity = AIRPORTS.filter(airport => airport.city !== null);
      const airportsWithoutCity = AIRPORTS.filter(airport => airport.city === null);
      
      expect(airportsWithCity.length).toBeGreaterThan(0);
      expect(airportsWithoutCity.length).toBeGreaterThan(0);
      
      // Test airport with city
      if (airportsWithCity.length > 0) {
        const airportWithCity = airportsWithCity[0];
        expect(airportWithCity.city).not.toBeNull();
        expect(airportWithCity.city).toHaveProperty('name');
        expect(airportWithCity.city).toHaveProperty('id');
        expect(airportWithCity.city).toHaveProperty('iataCode');
        expect(airportWithCity.city).toHaveProperty('iataCountryCode');
      }
    });

    it('should have valid data types for airport properties', () => {
      const airport = AIRPORTS[0];
      expect(typeof airport.name).toBe('string');
      expect(typeof airport.id).toBe('string');
      expect(typeof airport.iataCode).toBe('string');
      expect(typeof airport.icaoCode).toBe('string');
      expect(typeof airport.iataCountryCode).toBe('string');
      expect(typeof airport.cityName).toBe('string');
      expect(typeof airport.time_zone).toBe('string');
      expect(typeof airport.latitude).toBe('number');
      expect(typeof airport.longitude).toBe('number');
    });
  });

  describe('Airlines Data Loading', () => {
    it('should load airlines data successfully', () => {
      expect(AIRLINES).toBeDefined();
      expect(Array.isArray(AIRLINES)).toBe(true);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have properly structured airline objects', () => {
      const airline = AIRLINES[0];
      expect(airline).toHaveProperty('iataCode');
      expect(airline).toHaveProperty('name');
      expect(airline).toHaveProperty('id');
    });

    it('should have camelCase property names for airlines', () => {
      const airline = AIRLINES[0];
      expect(airline).toHaveProperty('iataCode');
      
      // Should NOT have snake_case version
      expect(airline).not.toHaveProperty('iata_code');
    });

    it('should filter out airlines without IATA codes', () => {
      // All airlines in the filtered array should have valid IATA codes
      AIRLINES.forEach(airline => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode).not.toBe('');
        expect(typeof airline.iataCode).toBe('string');
      });
    });

    it('should have valid data types for airline properties', () => {
      const airline = AIRLINES[0];
      expect(typeof airline.name).toBe('string');
      expect(typeof airline.id).toBe('string');
      expect(typeof airline.iataCode).toBe('string');
    });

    it('should have reasonable IATA code lengths for airlines', () => {
      AIRLINES.forEach(airline => {
        expect(airline.iataCode.length).toBeGreaterThan(0);
        expect(airline.iataCode.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Aircraft Data Loading', () => {
    it('should load aircraft data successfully', () => {
      expect(AIRCRAFT).toBeDefined();
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should have properly structured aircraft objects', () => {
      const aircraft = AIRCRAFT[0];
      expect(aircraft).toHaveProperty('iataCode');
      expect(aircraft).toHaveProperty('name');
      expect(aircraft).toHaveProperty('id');
    });

    it('should have camelCase property names for aircraft', () => {
      const aircraft = AIRCRAFT[0];
      expect(aircraft).toHaveProperty('iataCode');
      
      // Should NOT have snake_case version
      expect(aircraft).not.toHaveProperty('iata_code');
    });

    it('should have valid data types for aircraft properties', () => {
      const aircraft = AIRCRAFT[0];
      expect(typeof aircraft.name).toBe('string');
      expect(typeof aircraft.id).toBe('string');
      expect(typeof aircraft.iataCode).toBe('string');
    });

    it('should have reasonable IATA code lengths for aircraft', () => {
      AIRCRAFT.forEach(aircraft => {
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('Cross-data validation', () => {
    it('should ensure no duplicate IDs across all datasets', () => {
      const allIds = [
        ...AIRPORTS.map(a => a.id),
        ...AIRLINES.map(a => a.id),
        ...AIRCRAFT.map(a => a.id),
      ];
      
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should ensure all datasets have sufficient data for testing', () => {
      // Ensure we have enough data for meaningful tests
      expect(AIRPORTS.length).toBeGreaterThan(100);
      expect(AIRLINES.length).toBeGreaterThan(10);
      expect(AIRCRAFT.length).toBeGreaterThan(10);
    });

    it('should ensure IATA codes are consistently formatted', () => {
      // Check that IATA codes don't have unexpected whitespace or special characters
      const allIataCodes = [
        ...AIRPORTS.map(a => a.iataCode),
        ...AIRLINES.map(a => a.iataCode),
        ...AIRCRAFT.map(a => a.iataCode),
      ];

      allIataCodes.forEach(code => {
        expect(code).toBe(code.trim()); // No leading/trailing whitespace
        expect(code).not.toContain(' '); // No internal spaces
        expect(code.length).toBeGreaterThan(0);
      });
    });
  });
});