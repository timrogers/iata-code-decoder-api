import { cameliseKeys } from '../src/utils.js';

describe('Utility Functions', () => {
  describe('cameliseKeys', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        snake_case_key: 'value1',
        another_snake_case: 'value2',
        normalkey: 'value3',
      };

      const expected = {
        snakeCaseKey: 'value1',
        anotherSnakeCase: 'value2',
        normalkey: 'value3',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
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
      expect(result).toEqual(input);
    });

    it('should handle single character keys', () => {
      const input = {
        a: 'value1',
        b_c: 'value2',
      };

      const expected = {
        a: 'value1',
        bC: 'value2',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle multiple underscores', () => {
      const input = {
        snake_case_with_multiple_underscores: 'value1',
        single_underscore: 'value2',
      };

      const expected = {
        snakeCaseWithMultipleUnderscores: 'value1',
        singleUnderscore: 'value2',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should handle keys starting with underscore', () => {
      const input = {
        _leading_underscore: 'value1',
        trailing_underscore_: 'value2',
      };

      const expected = {
        _leadingUnderscore: 'value1',
        trailingUnderscore_: 'value2',
      };

      const result = cameliseKeys(input);
      expect(result).toEqual(expected);
    });

    it('should preserve values unchanged', () => {
      const input = {
        snake_case_key: { nested: 'object' },
        another_key: [1, 2, 3],
        number_key: 42,
        boolean_key: true,
        null_key: null,
      };

      const result = cameliseKeys(input);
      
      expect(result).toHaveProperty('snakeCaseKey');
      expect(result).toHaveProperty('anotherKey');
      expect(result).toHaveProperty('numberKey');
      expect(result).toHaveProperty('booleanKey');
      expect(result).toHaveProperty('nullKey');
      
      expect((result as any).snakeCaseKey).toEqual({ nested: 'object' });
      expect((result as any).anotherKey).toEqual([1, 2, 3]);
      expect((result as any).numberKey).toBe(42);
      expect((result as any).booleanKey).toBe(true);
      expect((result as any).nullKey).toBeNull();
    });
  });
});