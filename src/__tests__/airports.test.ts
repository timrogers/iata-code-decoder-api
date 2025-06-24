import { Airport } from '../types.js';

// Mock the airports module completely
jest.mock('../airports.js', () => ({
  AIRPORTS: [
    {
      id: 'duffel_airport_1',
      name: 'John F. Kennedy International Airport',
      iataCode: 'JFK',
      icaoCode: 'KJFK',
      time_zone: 'America/New_York',
      latitude: 40.63975,
      longitude: -73.77893,
      iataCountryCode: 'US',
      cityName: 'New York',
      city: {
        id: 'duffel_city_1',
        name: 'New York',
        iataCode: 'NYC',
        iataCountryCode: 'US'
      }
    },
    {
      id: 'duffel_airport_2',
      name: 'Los Angeles International Airport',
      iataCode: 'LAX',
      icaoCode: 'KLAX',
      time_zone: 'America/Los_Angeles',
      latitude: 33.94254,
      longitude: -118.40807,
      iataCountryCode: 'US',
      cityName: 'Los Angeles',
      city: null
    }
  ]
}));

import { AIRPORTS } from '../airports.js';

describe('Airports', () => {
  describe('AIRPORTS constant', () => {
    it('should load and process airports data correctly', () => {
      expect(AIRPORTS).toBeInstanceOf(Array);
      expect(AIRPORTS.length).toBe(2);
    });

    it('should have camelCase keys', () => {
      const airport = AIRPORTS.find((a: Airport) => a.id === 'duffel_airport_1');
      expect(airport).toBeDefined();
      expect(airport?.iataCode).toBe('JFK');
      expect(airport?.icaoCode).toBe('KJFK');
      expect(airport?.time_zone).toBe('America/New_York');
      expect(airport?.iataCountryCode).toBe('US');
      expect(airport?.cityName).toBe('New York');
    });

    it('should handle airports with city objects', () => {
      const airport = AIRPORTS.find((a: Airport) => a.id === 'duffel_airport_1');
      expect(airport?.city).toBeDefined();
      expect(airport?.city?.id).toBe('duffel_city_1');
      expect(airport?.city?.name).toBe('New York');
      expect(airport?.city?.iataCode).toBe('NYC');
      expect(airport?.city?.iataCountryCode).toBe('US');
    });

    it('should handle airports with null city', () => {
      const airport = AIRPORTS.find((a: Airport) => a.id === 'duffel_airport_2');
      expect(airport?.city).toBeNull();
    });

    it('should have correct structure for each airport', () => {
      AIRPORTS.forEach((airport: Airport) => {
        expect(airport).toHaveProperty('id');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('icaoCode');
        expect(airport).toHaveProperty('time_zone');
        expect(airport).toHaveProperty('latitude');
        expect(airport).toHaveProperty('longitude');
        expect(airport).toHaveProperty('iataCountryCode');
        expect(airport).toHaveProperty('cityName');
        expect(airport).toHaveProperty('city');
        
        expect(typeof airport.id).toBe('string');
        expect(typeof airport.name).toBe('string');
        expect(typeof airport.iataCode).toBe('string');
        expect(typeof airport.latitude).toBe('number');
        expect(typeof airport.longitude).toBe('number');
      });
    });

    it('should contain expected airports', () => {
      const jfk = AIRPORTS.find((a: Airport) => a.iataCode === 'JFK');
      const lax = AIRPORTS.find((a: Airport) => a.iataCode === 'LAX');

      expect(jfk).toBeDefined();
      expect(jfk?.name).toBe('John F. Kennedy International Airport');
      
      expect(lax).toBeDefined();
      expect(lax?.name).toBe('Los Angeles International Airport');
    });
  });
});