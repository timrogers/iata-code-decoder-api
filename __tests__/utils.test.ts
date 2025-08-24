import { cameliseKeys } from '../src/utils';

describe('Utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_key: 'value2',
        normalkey: 'value3',
      };

      const expected = {
        snakeCaseKey: 'value1',
        anotherKey: 'value2',
        normalkey: 'value3',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle empty objects', () => {
      const result = cameliseKeys({});
      expect(result).toEqual({});
    });

    it('should handle objects with mixed key formats', () => {
      const input = {
        already_camelCase: 'value1',
        snake_case: 'value2',
        'kebab-case': 'value3',
        normal: 'value4',
      };

      const expected = {
        alreadyCamelCase: 'value1',
        snakeCase: 'value2',
        'kebab-case': 'value3', // kebab-case is not converted by this function
        normal: 'value4',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should preserve value types', () => {
      const input = {
        string_key: 'string',
        number_key: 42,
        boolean_key: true,
        null_key: null,
        array_key: [1, 2, 3],
        object_key: { nested: 'value' },
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        stringKey: 'string',
        numberKey: 42,
        booleanKey: true,
        nullKey: null,
        arrayKey: [1, 2, 3],
        objectKey: { nested: 'value' },
      });
    });

    it('should handle single character keys', () => {
      const input = {
        a: 'value1',
        b_c: 'value2',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual({
        a: 'value1',
        bC: 'value2',
      });
    });
  });
});
