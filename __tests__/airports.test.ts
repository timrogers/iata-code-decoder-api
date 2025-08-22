// Mock the entire data loading modules before importing
jest.mock('../data/airports.json', () => [
  {
    id: 'airport1',
    name: 'Test Airport 1',
    iata_code: 'LHR',
    icao_code: 'EGLL',
    iata_country_code: 'GB',
    city_name: 'London',
    latitude: 51.4775,
    longitude: -0.4614,
    time_zone: 'Europe/London',
    city: {
      id: 'city1',
      name: 'London',
      iata_code: 'LON',
      iata_country_code: 'GB'
    }
  },
  {
    id: 'airport2',
    name: 'Test Airport 2', 
    iata_code: 'JFK',
    icao_code: 'KJFK',
    iata_country_code: 'US',
    city_name: 'New York',
    latitude: 40.6413,
    longitude: -73.7781,
    time_zone: 'America/New_York',
    city: null
  }
]);

import { AIRPORTS } from '../src/airports';

describe('Airports', () => {
  describe('AIRPORTS export', () => {
    it('should load and transform airport data correctly', () => {
      expect(AIRPORTS).toBeDefined();
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS).toHaveLength(2);
    });

    it('should convert snake_case keys to camelCase for airport data', () => {
      const airport = AIRPORTS.find(a => a.id === 'airport1');
      expect(airport).toEqual({
        id: 'airport1',
        name: 'Test Airport 1',
        iataCode: 'LHR',
        icaoCode: 'EGLL',
        iataCountryCode: 'GB',
        cityName: 'London',
        latitude: 51.4775,
        longitude: -0.4614,
        timeZone: 'Europe/London',
        city: {
          id: 'city1',
          name: 'London',
          iataCode: 'LON',
          iataCountryCode: 'GB'
        }
      });
    });

    it('should convert snake_case keys to camelCase for nested city data', () => {
      const airportWithCity = AIRPORTS.find(a => a.city !== null);
      expect(airportWithCity?.city).toBeDefined();
      expect(airportWithCity?.city).toHaveProperty('iataCode');
      expect(airportWithCity?.city).toHaveProperty('iataCountryCode');
      expect(airportWithCity?.city).not.toHaveProperty('iata_code');
      expect(airportWithCity?.city).not.toHaveProperty('iata_country_code');
    });

    it('should handle airports with null city data', () => {
      const airportWithoutCity = AIRPORTS.find(a => a.id === 'airport2');
      expect(airportWithoutCity).toBeDefined();
      expect(airportWithoutCity?.city).toBeNull();
      expect(airportWithoutCity?.iataCode).toBe('JFK');
    });

    it('should have correct structure for all airports', () => {
      AIRPORTS.forEach(airport => {
        expect(airport).toHaveProperty('id');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('icaoCode');
        expect(airport).toHaveProperty('iataCountryCode');
        expect(airport).toHaveProperty('cityName');
        expect(airport).toHaveProperty('latitude');
        expect(airport).toHaveProperty('longitude');
        expect(airport).toHaveProperty('timeZone');
        expect(airport).toHaveProperty('city');
        
        expect(typeof airport.id).toBe('string');
        expect(typeof airport.name).toBe('string');
        expect(typeof airport.iataCode).toBe('string');
        expect(typeof airport.latitude).toBe('number');
        expect(typeof airport.longitude).toBe('number');
      });
    });
  });
});