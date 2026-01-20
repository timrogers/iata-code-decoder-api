import { cameliseKeys } from '../src/utils.js';

describe('utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_snake_key: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: 'value1',
        anotherSnakeKey: 'value2',
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

    it('should leave camelCase keys unchanged', () => {
      const input = {
        alreadyCamelCase: 'value1',
        anotherKey: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        alreadyCamelCase: 'value1',
        anotherKey: 'value2',
      });
    });

    it('should handle keys without underscores', () => {
      const input = {
        simple: 'value1',
        key: 'value2',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        simple: 'value1',
        key: 'value2',
      });
    });

    it('should preserve values unchanged', () => {
      const input = {
        snake_key: 123,
        another_key: true,
        third_key: null,
        fourth_key: { nested: 'object' },
        fifth_key: ['array', 'values'],
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeKey: 123,
        anotherKey: true,
        thirdKey: null,
        fourthKey: { nested: 'object' },
        fifthKey: ['array', 'values'],
      });
    });

    it('should handle empty objects', () => {
      const input = {};

      const result = cameliseKeys(input);

      expect(result).toEqual({});
    });

    it('should handle mixed case keys', () => {
      const input = {
        some_snake_case: 'value1',
        someAlreadyCamel: 'value2',
        UPPERCASE: 'value3',
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        someSnakeCase: 'value1',
        someAlreadyCamel: 'value2',
        UPPERCASE: 'value3',
      });
    });
  });
});
