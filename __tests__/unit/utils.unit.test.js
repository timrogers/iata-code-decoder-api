import { cameliseKeys } from '../../src/utils.js';
describe('Utils - Unit Tests', () => {
    describe('cameliseKeys', () => {
        it('should convert snake_case keys to camelCase', () => {
            const input = {
                snake_case_key: 'value1',
                another_snake_key: 'value2',
                normal_key: 'value3'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                snakeCaseKey: 'value1',
                anotherSnakeKey: 'value2',
                normalKey: 'value3'
            });
        });
        it('should handle single word keys without underscores', () => {
            const input = {
                key: 'value1',
                another: 'value2',
                test: 'value3'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                key: 'value1',
                another: 'value2',
                test: 'value3'
            });
        });
        it('should handle keys with multiple underscores', () => {
            const input = {
                very_long_snake_case_key: 'value1',
                another_very_long_key_name: 'value2'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                veryLongSnakeCaseKey: 'value1',
                anotherVeryLongKeyName: 'value2'
            });
        });
        it('should handle empty object', () => {
            const input = {};
            const result = cameliseKeys(input);
            expect(result).toEqual({});
        });
        it('should preserve value types and not modify them', () => {
            const input = {
                string_key: 'string value',
                number_key: 42,
                boolean_key: true,
                null_key: null,
                undefined_key: undefined,
                array_key: [1, 2, 3],
                object_key: { nested: 'value' }
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                stringKey: 'string value',
                numberKey: 42,
                booleanKey: true,
                nullKey: null,
                undefinedKey: undefined,
                arrayKey: [1, 2, 3],
                objectKey: { nested: 'value' }
            });
        });
        it('should handle keys starting with underscore', () => {
            const input = {
                _private_key: 'value1',
                __double_underscore: 'value2'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                _privateKey: 'value1',
                __doubleUnderscore: 'value2'
            });
        });
        it('should handle keys ending with underscore', () => {
            const input = {
                key_with_trailing_: 'value1',
                another_key_: 'value2'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                keyWithTrailing_: 'value1',
                anotherKey_: 'value2'
            });
        });
        it('should handle mixed case in original keys', () => {
            const input = {
                Mixed_Case_Key: 'value1',
                UPPER_CASE_KEY: 'value2',
                lower_case_key: 'value3'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                mixedCaseKey: 'value1',
                upperCaseKey: 'value2',
                lowerCaseKey: 'value3'
            });
        });
        it('should handle keys with consecutive underscores', () => {
            const input = {
                key__with__double: 'value1',
                key___with___triple: 'value2'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                keyWithDouble: 'value1',
                keyWithTriple: 'value2'
            });
        });
        it('should handle numeric keys as strings', () => {
            const input = {
                key_123: 'value1',
                key_with_456_numbers: 'value2'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                key123: 'value1',
                keyWith456Numbers: 'value2'
            });
        });
        it('should handle special characters in values without affecting them', () => {
            const input = {
                special_key: 'value_with_underscores',
                another_key: 'value-with-dashes',
                json_key: '{"nested_json": "value"}'
            };
            const result = cameliseKeys(input);
            expect(result).toEqual({
                specialKey: 'value_with_underscores',
                anotherKey: 'value-with-dashes',
                jsonKey: '{"nested_json": "value"}'
            });
        });
        it('should be idempotent - applying twice should give same result', () => {
            const input = {
                snake_case_key: 'value1',
                another_snake_key: 'value2'
            };
            const firstResult = cameliseKeys(input);
            const secondResult = cameliseKeys(firstResult);
            expect(firstResult).toEqual(secondResult);
        });
        it('should handle real-world airport data structure', () => {
            const airportData = {
                time_zone: 'America/New_York',
                iata_code: 'JFK',
                icao_code: 'KJFK',
                iata_country_code: 'US',
                city_name: 'New York'
            };
            const result = cameliseKeys(airportData);
            expect(result).toEqual({
                timeZone: 'America/New_York',
                iataCode: 'JFK',
                icaoCode: 'KJFK',
                iataCountryCode: 'US',
                cityName: 'New York'
            });
        });
        it('should handle real-world airline data structure', () => {
            const airlineData = {
                iata_code: 'AA',
                conditions_of_carriage_url: 'https://example.com',
                logo_symbol_url: 'https://example.com/logo.svg'
            };
            const result = cameliseKeys(airlineData);
            expect(result).toEqual({
                iataCode: 'AA',
                conditionsOfCarriageUrl: 'https://example.com',
                logoSymbolUrl: 'https://example.com/logo.svg'
            });
        });
        it('should handle performance with large objects', () => {
            // Create a large object to test performance
            const largeObject = {};
            for (let i = 0; i < 1000; i++) {
                largeObject[`test_key_${i}`] = `value_${i}`;
            }
            const startTime = Date.now();
            const result = cameliseKeys(largeObject);
            const endTime = Date.now();
            // Should complete quickly (within 100ms for 1000 keys)
            expect(endTime - startTime).toBeLessThan(100);
            // Verify transformation worked
            expect(result).toHaveProperty('testKey0', 'value_0');
            expect(result).toHaveProperty('testKey999', 'value_999');
            expect(Object.keys(result)).toHaveLength(1000);
        });
    });
});
