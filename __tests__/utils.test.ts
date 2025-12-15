import { cameliseKeys } from '../src/utils.js';

describe('Utils Module', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = { first_name: 'John', last_name: 'Doe' };
      const expected = { firstName: 'John', lastName: 'Doe' };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should handle single word keys (no conversion needed)', () => {
      const input = { name: 'Test', id: '123' };
      const expected = { name: 'Test', id: '123' };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should handle multiple underscores in keys', () => {
      const input = { first_middle_last_name: 'Test' };
      const expected = { firstMiddleLastName: 'Test' };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should preserve values while converting keys', () => {
      const input = {
        string_value: 'hello',
        number_value: 42,
        boolean_value: true,
        null_value: null,
        array_value: [1, 2, 3],
      };
      const expected = {
        stringValue: 'hello',
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
        arrayValue: [1, 2, 3],
      };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should handle empty objects', () => {
      expect(cameliseKeys({})).toEqual({});
    });

    it('should handle keys with leading underscore', () => {
      const input = { _private_key: 'secret' };
      // The function converts _p to P, so _private_key becomes PrivateKey
      const result = cameliseKeys(input);
      expect(result).toHaveProperty('PrivateKey');
    });

    it('should handle keys with numbers', () => {
      // Numbers after underscores don't trigger uppercase conversion since they are not letters
      const input = { value_1: 'one', value_2: 'two' };
      const expected = { value_1: 'one', value_2: 'two' };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should handle already camelCase keys without modification', () => {
      const input = { firstName: 'John', lastName: 'Doe' };
      const expected = { firstName: 'John', lastName: 'Doe' };

      expect(cameliseKeys(input)).toEqual(expected);
    });

    it('should convert airport data format correctly', () => {
      const airportData = {
        city_name: 'London',
        icao_code: 'EGLL',
        iata_country_code: 'GB',
        iata_code: 'LHR',
        latitude: 51.4775,
        longitude: -0.461389,
        time_zone: 'Europe/London',
        name: 'Heathrow Airport',
        id: 'arp_lhr_gb',
      };

      const result = cameliseKeys(airportData);

      expect(result).toEqual({
        cityName: 'London',
        icaoCode: 'EGLL',
        iataCountryCode: 'GB',
        iataCode: 'LHR',
        latitude: 51.4775,
        longitude: -0.461389,
        timeZone: 'Europe/London',
        name: 'Heathrow Airport',
        id: 'arp_lhr_gb',
      });
    });

    it('should convert airline data format correctly', () => {
      const airlineData = {
        logo_symbol_url: 'https://example.com/logo.svg',
        logo_lockup_url: 'https://example.com/lockup.svg',
        conditions_of_carriage_url: 'https://example.com/conditions',
        iata_code: 'BA',
        name: 'British Airways',
        id: 'arl_ba',
      };

      const result = cameliseKeys(airlineData);

      expect(result).toEqual({
        logoSymbolUrl: 'https://example.com/logo.svg',
        logoLockupUrl: 'https://example.com/lockup.svg',
        conditionsOfCarriageUrl: 'https://example.com/conditions',
        iataCode: 'BA',
        name: 'British Airways',
        id: 'arl_ba',
      });
    });

    it('should convert aircraft data format correctly', () => {
      const aircraftData = {
        iata_code: '777',
        name: 'Boeing 777',
        id: 'arc_777',
      };

      const result = cameliseKeys(aircraftData);

      expect(result).toEqual({
        iataCode: '777',
        name: 'Boeing 777',
        id: 'arc_777',
      });
    });
  });
});
