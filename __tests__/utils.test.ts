import { snakeCaseToCamelCase } from '../src/utils.js';

describe('snakeCaseToCamelCase', () => {
  it('should convert snake_case strings to camelCase', () => {
    expect(snakeCaseToCamelCase('snake_case_to_camel_case')).toBe('snakeCaseToCamelCase');
  });
});
