import { describe, test, expect } from '@jest/globals';
import { cameliseKeys } from '../src/utils.js';

describe('cameliseKeys', () => {
  test('should convert snake_case keys to camelCase', () => {
    const input = {
      snake_case: 'value1',
      another_snake_case: 'value2',
      normal: 'value3',
    };

    const expected = {
      snakeCase: 'value1',
      anotherSnakeCase: 'value2',
      normal: 'value3',
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle single underscore', () => {
    const input = {
      simple_case: 'value',
    };

    const expected = {
      simpleCase: 'value',
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle multiple underscores', () => {
    const input = {
      very_long_snake_case_key: 'value',
    };

    const expected = {
      veryLongSnakeCaseKey: 'value',
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle empty object', () => {
    const input = {};
    const expected = {};

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle mixed key formats', () => {
    const input = {
      snake_case: 'value1',
      camelCase: 'value2',
      'kebab-case': 'value3', // Note: function doesn't handle kebab-case, but testing anyway
      normal: 'value4',
    };

    const expected = {
      snakeCase: 'value1',
      camelCase: 'value2',
      'kebab-case': 'value3', // This stays the same
      normal: 'value4',
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should preserve values regardless of type', () => {
    const input = {
      string_value: 'test',
      number_value: 42,
      boolean_value: true,
      null_value: null,
      array_value: [1, 2, 3],
      object_value: { nested: 'object' },
    };

    const expected = {
      stringValue: 'test',
      numberValue: 42,
      booleanValue: true,
      nullValue: null,
      arrayValue: [1, 2, 3],
      objectValue: { nested: 'object' },
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle keys that start with underscore', () => {
    const input = {
      _private_key: 'value',
    };

    const expected = {
      PrivateKey: 'value', // Note: this is the expected behavior based on the regex
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });

  test('should handle keys that end with underscore', () => {
    const input = {
      trailing_: 'value',
    };

    const expected = {
      'trailing_': 'value', // Should remain unchanged as no _letter pattern
    };

    const result = cameliseKeys(input);
    expect(result).toEqual(expected);
  });
});