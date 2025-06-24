import { cameliseKeys } from '../utils.js';

describe('Utils', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_snake_key: 'value2',
        normalkey: 'value3'
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: 'value1',
        anotherSnakeKey: 'value2',
        normalkey: 'value3'
      });
    });

    it('should handle multiple underscores', () => {
      const input = {
        very_long_snake_case_key: 'value1',
        another__double__underscore: 'value2'
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        veryLongSnakeCaseKey: 'value1',
        another_Double_Underscore: 'value2'
      });
    });

    it('should handle empty object', () => {
      const input = {};
      const result = cameliseKeys(input);
      expect(result).toEqual({});
    });

    it('should handle object with no snake_case keys', () => {
      const input = {
        normalKey: 'value1',
        anotherKey: 'value2'
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        normalKey: 'value1',
        anotherKey: 'value2'
      });
    });

    it('should handle mixed case keys', () => {
      const input = {
        snake_case_key: 'value1',
        camelCaseKey: 'value2',
        PascalCaseKey: 'value3',
        'kebab-case-key': 'value4'
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: 'value1',
        camelCaseKey: 'value2',
        PascalCaseKey: 'value3',
        'kebab-case-key': 'value4'
      });
    });

    it('should preserve values unchanged', () => {
      const input = {
        snake_case_key: { nested: 'object' },
        another_key: [1, 2, 3],
        third_key: null,
        fourth_key: undefined,
        fifth_key: 42
      };

      const result = cameliseKeys(input);

      expect(result).toEqual({
        snakeCaseKey: { nested: 'object' },
        anotherKey: [1, 2, 3],
        thirdKey: null,
        fourthKey: undefined,
        fifthKey: 42
      });
    });
  });
});