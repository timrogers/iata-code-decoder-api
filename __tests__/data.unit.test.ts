import { AIRCRAFT } from '../src/aircraft.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRPORTS } from '../src/airports.js';
import { cameliseKeys } from '../src/utils.js';

describe('Data modules and utilities', () => {
  describe('cameliseKeys', () => {
    it('converts snake_case keys to camelCase without mutating the input', () => {
      const input = {
        iata_code: 'LHR',
        city_name: 'London',
        alreadyCamel: 'ok',
      };

      const result = cameliseKeys(input) as Record<string, unknown>;

      expect(result).toEqual({
        iataCode: 'LHR',
        cityName: 'London',
        alreadyCamel: 'ok',
      });
      expect(input).toHaveProperty('iata_code', 'LHR');
      expect(input).not.toHaveProperty('iataCode');
    });
  });

  describe('AIRPORTS', () => {
    it('camelises airport data keys', () => {
      const airport = AIRPORTS[0] as unknown as Record<string, unknown>;

      expect(AIRPORTS.length).toBeGreaterThan(0);
      expect(airport).toHaveProperty('iataCode');
      expect(airport).toHaveProperty('iataCountryCode');
      expect(airport).toHaveProperty('timeZone');
      expect(airport).not.toHaveProperty('iata_code');
      expect(airport).not.toHaveProperty('time_zone');
    });

    it('camelises nested city keys when present', () => {
      const airportWithCity = AIRPORTS.find((airport) => airport.city !== null);

      expect(airportWithCity).toBeDefined();

      const city = (
        airportWithCity as unknown as { city: Record<string, unknown> }
      ).city;
      expect(city).toHaveProperty('iataCode');
      expect(city).toHaveProperty('iataCountryCode');
      expect(city).not.toHaveProperty('iata_code');
    });
  });

  describe('AIRLINES', () => {
    it('filters out airlines without IATA codes', () => {
      expect(AIRLINES.length).toBeGreaterThan(0);
      expect(
        AIRLINES.every(
          (airline) => airline.iataCode !== undefined && airline.iataCode !== null,
        ),
      ).toBe(true);
    });
  });

  describe('AIRCRAFT', () => {
    it('camelises aircraft data keys', () => {
      expect(AIRCRAFT.length).toBeGreaterThan(0);

      const aircraft = AIRCRAFT[0] as unknown as Record<string, unknown>;
      expect(aircraft).toHaveProperty('iataCode');
      expect(aircraft).toHaveProperty('name');
      expect(aircraft).not.toHaveProperty('iata_code');
    });
  });
});
