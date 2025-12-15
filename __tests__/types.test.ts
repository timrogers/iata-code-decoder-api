import { City, Airport, Aircraft, Airline, Keyable } from '../src/types.js';

describe('Types Module', () => {
  describe('City interface', () => {
    it('should allow creating valid City objects', () => {
      const city: City = {
        name: 'London',
        id: 'cit_lon',
        iataCode: 'LON',
        iataCountryCode: 'GB',
      };

      expect(city.name).toBe('London');
      expect(city.id).toBe('cit_lon');
      expect(city.iataCode).toBe('LON');
      expect(city.iataCountryCode).toBe('GB');
    });
  });

  describe('Airport interface', () => {
    it('should allow creating valid Airport objects with city', () => {
      const airport: Airport = {
        time_zone: 'Europe/London',
        name: 'Heathrow Airport',
        longitude: -0.461389,
        latitude: 51.4775,
        id: 'arp_lhr_gb',
        icaoCode: 'EGLL',
        iataCode: 'LHR',
        iataCountryCode: 'GB',
        cityName: 'London',
        city: {
          name: 'London',
          id: 'cit_lon',
          iataCode: 'LON',
          iataCountryCode: 'GB',
        },
      };

      expect(airport.name).toBe('Heathrow Airport');
      expect(airport.iataCode).toBe('LHR');
      expect(airport.city?.name).toBe('London');
    });

    it('should allow creating valid Airport objects without city', () => {
      const airport: Airport = {
        time_zone: 'Europe/London',
        name: 'Test Airport',
        longitude: 0,
        latitude: 0,
        id: 'arp_test',
        icaoCode: 'TEST',
        iataCode: 'TST',
        iataCountryCode: 'XX',
        cityName: 'Test City',
        city: null,
      };

      expect(airport.city).toBeNull();
    });
  });

  describe('Aircraft interface', () => {
    it('should allow creating valid Aircraft objects', () => {
      const aircraft: Aircraft = {
        iataCode: '777',
        id: 'arc_777',
        name: 'Boeing 777',
      };

      expect(aircraft.iataCode).toBe('777');
      expect(aircraft.name).toBe('Boeing 777');
      expect(aircraft.id).toBe('arc_777');
    });
  });

  describe('Airline interface', () => {
    it('should allow creating valid Airline objects', () => {
      const airline: Airline = {
        id: 'arl_ba',
        name: 'British Airways',
        iataCode: 'BA',
      };

      expect(airline.iataCode).toBe('BA');
      expect(airline.name).toBe('British Airways');
      expect(airline.id).toBe('arl_ba');
    });
  });

  describe('Keyable interface', () => {
    it('should allow objects with any string keys', () => {
      const keyable: Keyable = {
        iataCode: 'TEST',
        name: 'Test Object',
        customField: 'custom value',
        numericField: 42,
        booleanField: true,
        nestedField: { inner: 'value' },
      };

      expect(keyable.iataCode).toBe('TEST');
      expect(keyable.customField).toBe('custom value');
      expect(keyable.numericField).toBe(42);
    });

    it('should be usable for filtering operations', () => {
      const objects: Keyable[] = [
        { iataCode: 'AA', name: 'American Airlines' },
        { iataCode: 'BA', name: 'British Airways' },
        { iataCode: 'CA', name: 'Air China' },
      ];

      const filtered = objects.filter((obj) => obj.iataCode.startsWith('A'));

      expect(filtered.length).toBe(1);
      expect(filtered[0].iataCode).toBe('AA');
    });
  });
});
