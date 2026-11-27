import { cameliseKeys } from '../src/utils.js';

describe('cameliseKeys', () => {
  it('converts snake_case keys to camelCase', () => {
    expect(cameliseKeys({ snake_case: 'value' })).toEqual({ snakeCase: 'value' });
  });

  it('converts multiple snake_case keys to camelCase', () => {
    expect(cameliseKeys({ first_name: 'John', last_name: 'Doe' })).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('converts keys with multiple underscores', () => {
    expect(cameliseKeys({ some_long_key_name: 'value' })).toEqual({
      someLongKeyName: 'value',
    });
  });

  it('leaves already camelCase keys unchanged', () => {
    expect(cameliseKeys({ alreadyCamelCase: 'value' })).toEqual({
      alreadyCamelCase: 'value',
    });
  });

  it('returns an empty object when given an empty object', () => {
    expect(cameliseKeys({})).toEqual({});
  });

  it('preserves values of all types', () => {
    expect(
      cameliseKeys({
        string_key: 'string',
        number_key: 42,
        bool_key: true,
        null_key: null,
        array_key: [1, 2, 3],
      }),
    ).toEqual({
      stringKey: 'string',
      numberKey: 42,
      boolKey: true,
      nullKey: null,
      arrayKey: [1, 2, 3],
    });
  });

  it('uses memoization: returns the same result for repeated calls with the same key', () => {
    const first = cameliseKeys({ some_key: 'a' });
    const second = cameliseKeys({ some_key: 'b' });

    expect(first).toEqual({ someKey: 'a' });
    expect(second).toEqual({ someKey: 'b' });
  });
});

