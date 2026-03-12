import { cameliseKeys } from '../src/utils.js';

describe('utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = { iata_code: 'LHR', city_name: 'London' };
      const result = cameliseKeys(input);
      expect(result).toEqual({ iataCode: 'LHR', cityName: 'London' });
    });

    it('should leave already camelCase keys unchanged', () => {
      const input = { iataCode: 'LHR', name: 'Heathrow' };
      const result = cameliseKeys(input);
      expect(result).toEqual({ iataCode: 'LHR', name: 'Heathrow' });
    });

    it('should handle keys with no underscores', () => {
      const input = { name: 'Test', id: '123' };
      const result = cameliseKeys(input);
      expect(result).toEqual({ name: 'Test', id: '123' });
    });

    it('should handle keys with multiple underscores', () => {
      const input = { iata_country_code: 'GB' };
      const result = cameliseKeys(input);
      expect(result).toEqual({ iataCountryCode: 'GB' });
    });

    it('should handle an empty object', () => {
      const result = cameliseKeys({});
      expect(result).toEqual({});
    });

    it('should preserve values of different types', () => {
      const input = {
        string_val: 'text',
        number_val: 42,
        boolean_val: true,
        null_val: null,
        array_val: [1, 2, 3],
      };
      const result = cameliseKeys(input);
      expect(result).toEqual({
        stringVal: 'text',
        numberVal: 42,
        booleanVal: true,
        nullVal: null,
        arrayVal: [1, 2, 3],
      });
    });

    it('should not deeply convert nested object keys', () => {
      const input = {
        outer_key: { inner_key: 'value' },
      };
      const result = cameliseKeys(input) as Record<string, unknown>;
      // cameliseKeys only converts top-level keys
      expect(result).toHaveProperty('outerKey');
      expect(result.outerKey).toEqual({ inner_key: 'value' });
    });

    it('should handle single character after underscore', () => {
      const input = { iata_x: 'val' };
      const result = cameliseKeys(input);
      expect(result).toEqual({ iataX: 'val' });
    });
  });
});
