// Unit tests for TypeScript interfaces and types
// These tests primarily serve to verify type definitions are correct

import {
  City,
  Airport,
  Aircraft,
  Airline,
  ObjectWithIataCode,
  Keyable,
} from '../src/types';

describe('TypeScript Interfaces', () => {
  describe('City interface', () => {
    it('should accept valid city objects', () => {
      const validCity: City = {
        name: 'London',
        id: 'city1',
        iataCode: 'LON',
        iataCountryCode: 'GB',
      };

      expect(validCity.name).toBe('London');
      expect(validCity.id).toBe('city1');
      expect(validCity.iataCode).toBe('LON');
      expect(validCity.iataCountryCode).toBe('GB');
    });
  });

  describe('Airport interface', () => {
    it('should accept valid airport objects with city', () => {
      const validAirport: Airport = {
        time_zone: 'Europe/London',
        name: 'London Heathrow Airport',
        longitude: -0.4614,
        latitude: 51.4775,
        id: 'airport1',
        icaoCode: 'EGLL',
        iataCode: 'LHR',
        iataCountryCode: 'GB',
        cityName: 'London',
        city: {
          name: 'London',
          id: 'city1',
          iataCode: 'LON',
          iataCountryCode: 'GB',
        },
      };

      expect(validAirport.iataCode).toBe('LHR');
      expect(validAirport.city).not.toBeNull();
      expect(validAirport.city?.iataCode).toBe('LON');
    });

    it('should accept valid airport objects with null city', () => {
      const validAirport: Airport = {
        time_zone: 'America/New_York',
        name: 'John F Kennedy International',
        longitude: -73.7781,
        latitude: 40.6413,
        id: 'airport2',
        icaoCode: 'KJFK',
        iataCode: 'JFK',
        iataCountryCode: 'US',
        cityName: 'New York',
        city: null,
      };

      expect(validAirport.iataCode).toBe('JFK');
      expect(validAirport.city).toBeNull();
    });
  });

  describe('Aircraft interface', () => {
    it('should accept valid aircraft objects', () => {
      const validAircraft: Aircraft = {
        iataCode: '738',
        id: 'aircraft1',
        name: 'Boeing 737-800',
      };

      expect(validAircraft.iataCode).toBe('738');
      expect(validAircraft.id).toBe('aircraft1');
      expect(validAircraft.name).toBe('Boeing 737-800');
    });
  });

  describe('Airline interface', () => {
    it('should accept valid airline objects', () => {
      const validAirline: Airline = {
        id: 'airline1',
        name: 'British Airways',
        iataCode: 'BA',
      };

      expect(validAirline.iataCode).toBe('BA');
      expect(validAirline.id).toBe('airline1');
      expect(validAirline.name).toBe('British Airways');
    });
  });

  describe('ObjectWithIataCode interface', () => {
    it('should accept objects with iataCode property', () => {
      const validObject: ObjectWithIataCode = {
        iataCode: 'TEST',
      };

      expect(validObject.iataCode).toBe('TEST');
    });

    it('should work with extended objects', () => {
      const extendedObject: ObjectWithIataCode & { name: string } = {
        iataCode: 'TEST',
        name: 'Test Object',
      };

      expect(extendedObject.iataCode).toBe('TEST');
      expect(extendedObject.name).toBe('Test Object');
    });
  });

  describe('Keyable interface', () => {
    it('should accept objects with any string keys', () => {
      const validKeyable: Keyable = {
        someKey: 'someValue',
        anotherKey: 123,
        yetAnotherKey: true,
        objectKey: { nested: 'value' },
      };

      expect(validKeyable.someKey).toBe('someValue');
      expect(validKeyable.anotherKey).toBe(123);
      expect(validKeyable.yetAnotherKey).toBe(true);
      expect(validKeyable.objectKey).toEqual({ nested: 'value' });
    });

    it('should allow dynamic property access', () => {
      const keyable: Keyable = {};
      keyable['dynamicKey'] = 'dynamicValue';

      expect(keyable.dynamicKey).toBe('dynamicValue');
      expect(keyable['dynamicKey']).toBe('dynamicValue');
    });
  });

  describe('Type compatibility', () => {
    it('should allow Airport to be used as ObjectWithIataCode', () => {
      const airport: Airport = {
        time_zone: 'UTC',
        name: 'Test Airport',
        longitude: 0,
        latitude: 0,
        id: 'test',
        icaoCode: 'TEST',
        iataCode: 'TST',
        iataCountryCode: 'TS',
        cityName: 'Test City',
        city: null,
      };

      const objectWithIataCode: ObjectWithIataCode = airport;
      expect(objectWithIataCode.iataCode).toBe('TST');
    });

    it('should allow Airline to be used as ObjectWithIataCode', () => {
      const airline: Airline = {
        id: 'test',
        name: 'Test Airline',
        iataCode: 'TA',
      };

      const objectWithIataCode: ObjectWithIataCode = airline;
      expect(objectWithIataCode.iataCode).toBe('TA');
    });

    it('should allow Aircraft to be used as ObjectWithIataCode', () => {
      const aircraft: Aircraft = {
        id: 'test',
        name: 'Test Aircraft',
        iataCode: 'TST',
      };

      const objectWithIataCode: ObjectWithIataCode = aircraft;
      expect(objectWithIataCode.iataCode).toBe('TST');
    });

    it('should allow all types to be used as Keyable', () => {
      const airport: Airport = {
        time_zone: 'UTC',
        name: 'Test Airport',
        longitude: 0,
        latitude: 0,
        id: 'test',
        icaoCode: 'TEST',
        iataCode: 'TST',
        iataCountryCode: 'TS',
        cityName: 'Test City',
        city: null,
      };

      const keyable: Keyable = airport;
      expect(keyable.iataCode).toBe('TST');
      expect(keyable['name']).toBe('Test Airport');
    });
  });
});
