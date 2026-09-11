import { snakeCaseToCamelCase } from '../src/utils.js';

describe('snakeCaseToCamelCase', () => {
  it('should convert snake_case strings to camelCase', () => {
    expect(snakeCaseToCamelCase('snake_case_to_camel_case')).toBe('snakeCaseToCamelCase');
  });

  it('should convert already snake_case strings', () => {
    expect(snakeCaseToCamelCase('already_snake_case')).toBe('alreadySnakeCase');
  });
});
