import { cameliseKeys } from '../src/utils.js';

describe('Utils - Unit Tests', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_key: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: 'value1',
        anotherKey: 'value2',
      });
    });

    it('should handle keys with multiple underscores', () => {
      const input = {
        this_is_a_long_key: 'value',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        thisIsALongKey: 'value',
      });
    });

    it('should handle keys that are already camelCase', () => {
      const input = {
        alreadyCamelCase: 'value',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        alreadyCamelCase: 'value',
      });
    });

    it('should handle empty objects', () => {
      const input = {};

      const result = cameliseKeys(input);

      expect(result).toEqual({});
    });

    it('should handle keys with mixed case', () => {
      const input = {
        Mixed_Case_Key: 'value',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        MixedCaseKey: 'value',
      });
    });

    it('should preserve the values unchanged', () => {
      const input = {
        snake_key: { nested: 'object' },
        another_key: [1, 2, 3],
        number_key: 42,
        boolean_key: true,
        null_key: null,
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeKey: { nested: 'object' },
        anotherKey: [1, 2, 3],
        numberKey: 42,
        booleanKey: true,
        nullKey: null,
      });
    });

    it('should handle keys with leading underscores', () => {
      const input = {
        _leading: 'value1',
        _another_key: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        Leading: 'value1',
        AnotherKey: 'value2',
      });
    });

    it('should preserve trailing underscores', () => {
      const input = {
        trailing_: 'value1',
        key_with_trailing_: 'value2',
      };

      const result = cameliseKeys(input);

      // Trailing underscores are preserved as the regex only matches _[a-z]
      expect(result).toEqual({
        trailing_: 'value1',
        keyWithTrailing_: 'value2',
      });
    });
  });
});
