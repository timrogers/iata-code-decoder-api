import {
  City,
  Airport,
  Aircraft,
  Airline,
  ObjectWithIataCode,
  Keyable,
} from '../types.js';

describe('Types', () => {
  describe('City interface', () => {
    it('should create a valid City object', () => {
      const city: City = {
        name: 'New York',
        id: 'nyc_001',
        iataCode: 'NYC',
        iataCountryCode: 'US',
      };

      expect(city.name).toBe('New York');
      expect(city.id).toBe('nyc_001');
      expect(city.iataCode).toBe('NYC');
      expect(city.iataCountryCode).toBe('US');
    });
  });

  describe('Airport interface', () => {
    it('should create a valid Airport object with city', () => {
      const city: City = {
        name: 'New York',
        id: 'nyc_001',
        iataCode: 'NYC',
        iataCountryCode: 'US',
      };

      const airport: Airport = {
        time_zone: 'America/New_York',
        name: 'John F. Kennedy International Airport',
        longitude: -73.7781,
        latitude: 40.6413,
        id: 'jfk_001',
        icaoCode: 'KJFK',
        iataCode: 'JFK',
        iataCountryCode: 'US',
        cityName: 'New York',
        city,
      };

      expect(airport.name).toBe('John F. Kennedy International Airport');
      expect(airport.iataCode).toBe('JFK');
      expect(airport.city).toEqual(city);
      expect(airport.longitude).toBe(-73.7781);
      expect(airport.latitude).toBe(40.6413);
    });

    it('should create a valid Airport object without city', () => {
      const airport: Airport = {
        time_zone: 'America/Los_Angeles',
        name: 'Los Angeles International Airport',
        longitude: -118.4085,
        latitude: 33.9425,
        id: 'lax_001',
        icaoCode: 'KLAX',
        iataCode: 'LAX',
        iataCountryCode: 'US',
        cityName: 'Los Angeles',
        city: null,
      };

      expect(airport.name).toBe('Los Angeles International Airport');
      expect(airport.iataCode).toBe('LAX');
      expect(airport.city).toBeNull();
    });
  });

  describe('Aircraft interface', () => {
    it('should create a valid Aircraft object', () => {
      const aircraft: Aircraft = {
        iataCode: '737',
        id: 'boeing_737',
        name: 'Boeing 737',
      };

      expect(aircraft.iataCode).toBe('737');
      expect(aircraft.id).toBe('boeing_737');
      expect(aircraft.name).toBe('Boeing 737');
    });
  });

  describe('Airline interface', () => {
    it('should create a valid Airline object', () => {
      const airline: Airline = {
        id: 'american_airlines',
        name: 'American Airlines',
        iataCode: 'AA',
      };

      expect(airline.id).toBe('american_airlines');
      expect(airline.name).toBe('American Airlines');
      expect(airline.iataCode).toBe('AA');
    });
  });

  describe('ObjectWithIataCode interface', () => {
    it('should create an object with IATA code', () => {
      const obj: ObjectWithIataCode = {
        iataCode: 'TEST',
      };

      expect(obj.iataCode).toBe('TEST');
    });
  });

  describe('Keyable interface', () => {
    it('should allow any key-value pairs', () => {
      const obj: Keyable = {
        anyKey: 'anyValue',
        numberKey: 123,
        booleanKey: true,
        arrayKey: [1, 2, 3],
      };

      expect(obj.anyKey).toBe('anyValue');
      expect(obj.numberKey).toBe(123);
      expect(obj.booleanKey).toBe(true);
      expect(obj.arrayKey).toEqual([1, 2, 3]);
    });
  });
});