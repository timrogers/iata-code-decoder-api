import { test, describe } from 'node:test';
import assert from 'node:assert';
import { cameliseKeys } from '../src/utils.js';

describe('Utility Functions', () => {
  test('cameliseKeys converts snake_case to camelCase', () => {
    const input = {
      snake_case_key: 'value1',
      another_snake_key: 'value2',
      already_camelCase: 'value3',
      simple: 'value4',
    };

    const result = cameliseKeys(input);

    assert.deepStrictEqual(result, {
      snakeCaseKey: 'value1',
      anotherSnakeKey: 'value2',
      alreadyCamelCase: 'value3',
      simple: 'value4',
    });
  });

  test('cameliseKeys handles empty object', () => {
    const result = cameliseKeys({});
    assert.deepStrictEqual(result, {});
  });

  test('cameliseKeys handles single character keys', () => {
    const input = { a: 'value1', b_c: 'value2' };
    const result = cameliseKeys(input);

    assert.deepStrictEqual(result, {
      a: 'value1',
      bC: 'value2',
    });
  });
});
