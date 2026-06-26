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

  it('handles keys with leading underscores', () => {
    // Leading underscore followed by lowercase is converted to uppercase
    expect(cameliseKeys({ _private_key: 'value' })).toEqual({ PrivateKey: 'value' });
  });

  it('handles keys with uppercase letters after underscores', () => {
    // Only underscores before lowercase letters trigger conversion
    expect(cameliseKeys({ some_KEY: 'value', another_MixedCase: 'test' })).toEqual({
      someKEY: 'value',
      anotherMixedCase: 'test',
    });
  });

  it('does not convert keys with hyphens', () => {
    // The regex only matches underscores, not hyphens
    expect(cameliseKeys({ 'some-key': 'value', 'multi-part-key': 'test' })).toEqual({
      'some-key': 'value',
      'multi-part-key': 'test',
    });
  });

  it('handles keys with consecutive underscores', () => {
    // Only the first underscore of consecutive underscores is matched
    expect(cameliseKeys({ some__double_key: 'value' })).toEqual({
      some_DoubleKey: 'value',
    });
  });

  it('preserves object values without recursion', () => {
    const nestedObj = { nested: 'value' };
    const result = cameliseKeys({ some_key: nestedObj });
    expect(result).toEqual({ someKey: nestedObj });
    expect(result.someKey).toBe(nestedObj);
  });

  it('handles undefined values', () => {
    expect(cameliseKeys({ some_key: undefined })).toEqual({ someKey: undefined });
  });

  it('handles single character keys with underscores', () => {
    expect(cameliseKeys({ a_b: 'value', x_y_z: 'test' })).toEqual({
      aB: 'value',
      xYZ: 'test',
    });
  });

  it('handles numeric values including zeros and negative numbers', () => {
    expect(cameliseKeys({ zero_val: 0, negative_val: -42, decimal_val: 3.14 })).toEqual({
      zeroVal: 0,
      negativeVal: -42,
      decimalVal: 3.14,
    });
  });

  it('handles boolean false and true values correctly', () => {
    expect(cameliseKeys({ is_active: true, is_deleted: false })).toEqual({
      isActive: true,
      isDeleted: false,
    });
  });

  it('handles real-world airport data structure', () => {
    // Real usage from airports.ts with nested city objects
    const airportData = {
      iata_code: 'LHR',
      name: 'London Heathrow',
      city: {
        name: 'London',
        country_code: 'GB',
      },
    };
    expect(cameliseKeys(airportData)).toEqual({
      iataCode: 'LHR',
      name: 'London Heathrow',
      city: {
        name: 'London',
        country_code: 'GB',
      },
    });
  });
});
