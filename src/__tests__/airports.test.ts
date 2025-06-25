import { AIRPORTS } from '../airports.js';
import { Airport, City } from '../types.js';

// Mock the JSON data to avoid loading large files in tests
jest.mock('../../data/airports.json', () => [
  {
    time_zone: 'America/New_York',
    name: 'John F. Kennedy International Airport',
    longitude: -73.7781,
    latitude: 40.6413,
    id: 'jfk_001',
    icao_code: 'KJFK',
    iata_code: 'JFK',
    iata_country_code: 'US',
    city_name: 'New York',
    city: {
      name: 'New York',
      id: 'nyc_001',
      iata_code: 'NYC',
      iata_country_code: 'US',
    },
  },
  {
    time_zone: 'America/Los_Angeles',
    name: 'Los Angeles International Airport',
    longitude: -118.4085,
    latitude: 33.9425,
    id: 'lax_001',
    icao_code: 'KLAX',
    iata_code: 'LAX',
    iata_country_code: 'US',
    city_name: 'Los Angeles',
    city: null,
  },
  {
    time_zone: 'Europe/London',
    name: 'London Heathrow Airport',
    longitude: -0.4614,
    latitude: 51.4700,
    id: 'lhr_001',
    icao_code: 'EGLL',
    iata_code: 'LHR',
    iata_country_code: 'GB',
    city_name: 'London',
    city: {
      name: 'London',
      id: 'lon_001',
      iata_code: 'LON',
      iata_country_code: 'GB',
    },
  },
], { virtual: true });

describe('Airports', () => {
  describe('AIRPORTS export', () => {
    it('should export an array of airports', () => {
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

         it('should have properly camelized keys for all airports', () => {
       AIRPORTS.forEach((airport: Airport) => {
         expect(airport).toHaveProperty('time_zone');
         expect(airport).toHaveProperty('name');
         expect(airport).toHaveProperty('longitude');
         expect(airport).toHaveProperty('latitude');
         expect(airport).toHaveProperty('id');
         expect(airport).toHaveProperty('icaoCode');
         expect(airport).toHaveProperty('iataCode');
         expect(airport).toHaveProperty('iataCountryCode');
         expect(airport).toHaveProperty('cityName');
         expect(airport).toHaveProperty('city');

         // Should not have original snake_case keys from raw data
         expect(airport).not.toHaveProperty('icao_code');
         expect(airport).not.toHaveProperty('iata_code');
         expect(airport).not.toHaveProperty('iata_country_code');
         expect(airport).not.toHaveProperty('city_name');
       });
     });

    it('should properly process airports with cities', () => {
      const jfkAirport = AIRPORTS.find(airport => airport.iataCode === 'JFK');
      expect(jfkAirport).toBeDefined();
      expect(jfkAirport?.city).not.toBeNull();
      expect(jfkAirport?.city).toHaveProperty('name', 'New York');
      expect(jfkAirport?.city).toHaveProperty('iataCode', 'NYC');
      expect(jfkAirport?.city).toHaveProperty('iataCountryCode', 'US');

      // City should also have camelized keys
      expect(jfkAirport?.city).not.toHaveProperty('iata_code');
      expect(jfkAirport?.city).not.toHaveProperty('iata_country_code');
    });

    it('should properly process airports without cities', () => {
      const laxAirport = AIRPORTS.find(airport => airport.iataCode === 'LAX');
      expect(laxAirport).toBeDefined();
      expect(laxAirport?.city).toBeNull();
    });

    it('should maintain correct data types', () => {
      const lhrAirport = AIRPORTS.find(airport => airport.iataCode === 'LHR');
      expect(lhrAirport).toBeDefined();
      
             if (lhrAirport) {
         expect(typeof lhrAirport.name).toBe('string');
         expect(typeof lhrAirport.longitude).toBe('number');
         expect(typeof lhrAirport.latitude).toBe('number');
         expect(typeof lhrAirport.time_zone).toBe('string');
         expect(typeof lhrAirport.id).toBe('string');
         expect(typeof lhrAirport.icaoCode).toBe('string');
         expect(typeof lhrAirport.iataCode).toBe('string');
         expect(typeof lhrAirport.iataCountryCode).toBe('string');
         expect(typeof lhrAirport.cityName).toBe('string');
       }
    });

    it('should have valid IATA codes', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(typeof airport.iataCode).toBe('string');
        expect(airport.iataCode.length).toBeGreaterThanOrEqual(2);
        expect(airport.iataCode.length).toBeLessThanOrEqual(3);
        expect(airport.iataCode).toMatch(/^[A-Z0-9]+$/);
      });
    });

    it('should have valid coordinates', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(typeof airport.longitude).toBe('number');
        expect(typeof airport.latitude).toBe('number');
        expect(airport.longitude).toBeGreaterThanOrEqual(-180);
        expect(airport.longitude).toBeLessThanOrEqual(180);
        expect(airport.latitude).toBeGreaterThanOrEqual(-90);
        expect(airport.latitude).toBeLessThanOrEqual(90);
      });
    });

    it('should have consistent city data when present', () => {
      AIRPORTS.forEach((airport: Airport) => {
        if (airport.city) {
          expect(typeof airport.city.name).toBe('string');
          expect(typeof airport.city.id).toBe('string');
          expect(typeof airport.city.iataCode).toBe('string');
          expect(typeof airport.city.iataCountryCode).toBe('string');
          expect(airport.city.iataCountryCode).toBe(airport.iataCountryCode);
        }
      });
    });
  });
});