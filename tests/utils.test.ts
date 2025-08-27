import { cameliseKeys } from '../src/utils';

describe('Utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_key: 'value2',
        normalkey: 'value3',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: 'value1',
        anotherKey: 'value2',
        normalkey: 'value3',
      });
    });

    it('should handle empty objects', () => {
      const input = {};
      const result = cameliseKeys(input);
      expect(result).toEqual({});
    });

    it('should handle objects with no snake_case keys', () => {
      const input = {
        normalKey: 'value1',
        anotherKey: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        normalKey: 'value1',
        anotherKey: 'value2',
      });
    });

    it('should handle multiple underscores', () => {
      const input = {
        very_long_snake_case_key: 'value',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        veryLongSnakeCaseKey: 'value',
      });
    });

    it('should preserve non-string values', () => {
      const input = {
        string_key: 'string',
        number_key: 42,
        boolean_key: true,
        null_key: null,
        array_key: [1, 2, 3],
        object_key: { nested: 'object' },
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        stringKey: 'string',
        numberKey: 42,
        booleanKey: true,
        nullKey: null,
        arrayKey: [1, 2, 3],
        objectKey: { nested: 'object' },
      });
    });
  });
});
