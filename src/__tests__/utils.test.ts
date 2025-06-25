import { cameliseKeys } from '../utils.js';

describe('Utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john.doe@example.com',
      };

      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john.doe@example.com',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle nested objects by only converting top-level keys', () => {
      const input = {
        user_info: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        contact_details: {
          phone_number: '123-456-7890',
        },
      };

      const expected = {
        userInfo: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        contactDetails: {
          phone_number: '123-456-7890',
        },
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle empty objects', () => {
      const input = {};
      const result = cameliseKeys(input);
      expect(result).toEqual({});
    });

    it('should handle objects with already camelCase keys', () => {
      const input = {
        firstName: 'Alice',
        lastName: 'Johnson',
        age: 30,
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(input);
    });

    it('should handle keys with multiple underscores', () => {
      const input = {
        very_long_property_name: 'test',
        another_multi_word_key: 'value',
      };

      const expected = {
        veryLongPropertyName: 'test',
        anotherMultiWordKey: 'value',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle keys with numbers', () => {
      const input = {
        property_1: 'value1',
        property_2_name: 'value2',
        key_3_test: 'value3',
      };

      const expected = {
        property_1: 'value1',
        property_2Name: 'value2',
        key_3Test: 'value3',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should preserve values of different types', () => {
      const input = {
        string_value: 'text',
        number_value: 42,
        boolean_value: true,
        array_value: [1, 2, 3],
        null_value: null,
        undefined_value: undefined,
      };

      const expected = {
        stringValue: 'text',
        numberValue: 42,
        booleanValue: true,
        arrayValue: [1, 2, 3],
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle single character keys', () => {
      const input = {
        a: 'value1',
        b_c: 'value2',
        d_: 'value3',
      };

      const expected = {
        a: 'value1',
        bC: 'value2',
        d_: 'value3',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });
  });
});