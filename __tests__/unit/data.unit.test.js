import { AIRPORTS } from '../../src/airports.js';
import { AIRLINES } from '../../src/airlines.js';
import { AIRCRAFT } from '../../src/aircraft.js';
describe('Data Modules - Unit Tests', () => {
    describe('AIRPORTS data', () => {
        it('should load airports data as an array', () => {
            expect(Array.isArray(AIRPORTS)).toBe(true);
            expect(AIRPORTS.length).toBeGreaterThan(0);
        });
        it('should have airports with required properties', () => {
            const airport = AIRPORTS[0];
            expect(airport).toHaveProperty('iataCode');
            expect(airport).toHaveProperty('name');
            expect(airport).toHaveProperty('id');
            expect(airport).toHaveProperty('iataCountryCode');
            expect(typeof airport.iataCode).toBe('string');
            expect(typeof airport.name).toBe('string');
            expect(typeof airport.id).toBe('string');
            expect(typeof airport.iataCountryCode).toBe('string');
        });
        it('should have airports with 3-character IATA codes', () => {
            const airportsWithInvalidCodes = AIRPORTS.filter(airport => !airport.iataCode || airport.iataCode.length !== 3);
            expect(airportsWithInvalidCodes).toEqual([]);
        });
        it('should have camelCase property names (transformed from snake_case)', () => {
            const airport = AIRPORTS[0];
            // Check that camelCase properties exist
            expect(airport).toHaveProperty('iataCode');
            expect(airport).toHaveProperty('iataCountryCode');
            expect(airport).toHaveProperty('cityName');
            // Check that snake_case properties don't exist
            expect(airport).not.toHaveProperty('iata_code');
            expect(airport).not.toHaveProperty('iata_country_code');
            expect(airport).not.toHaveProperty('city_name');
        });
        it('should handle city objects correctly when present', () => {
            const airportsWithCities = AIRPORTS.filter(airport => airport.city !== null);
            if (airportsWithCities.length > 0) {
                const airportWithCity = airportsWithCities[0];
                expect(airportWithCity.city).toHaveProperty('iataCode');
                expect(airportWithCity.city).toHaveProperty('name');
                expect(airportWithCity.city).toHaveProperty('id');
            }
        });
        it('should have consistent data types across all airports', () => {
            AIRPORTS.slice(0, 10).forEach(airport => {
                expect(typeof airport.iataCode).toBe('string');
                expect(typeof airport.name).toBe('string');
                expect(typeof airport.id).toBe('string');
                expect(typeof airport.iataCountryCode).toBe('string');
                if (airport.latitude !== null) {
                    expect(typeof airport.latitude).toBe('number');
                }
                if (airport.longitude !== null) {
                    expect(typeof airport.longitude).toBe('number');
                }
            });
        });
        it('should contain expected major airports', () => {
            const majorAirports = ['JFK', 'LAX', 'LHR', 'CDG', 'NRT', 'SYD'];
            majorAirports.forEach(code => {
                const airport = AIRPORTS.find(a => a.iataCode === code);
                expect(airport).toBeTruthy();
                expect(airport?.iataCode).toBe(code);
            });
        });
    });
    describe('AIRLINES data', () => {
        it('should load airlines data as an array', () => {
            expect(Array.isArray(AIRLINES)).toBe(true);
            expect(AIRLINES.length).toBeGreaterThan(0);
        });
        it('should have airlines with required properties', () => {
            const airline = AIRLINES[0];
            expect(airline).toHaveProperty('iataCode');
            expect(airline).toHaveProperty('name');
            expect(airline).toHaveProperty('id');
            expect(typeof airline.iataCode).toBe('string');
            expect(typeof airline.name).toBe('string');
            expect(typeof airline.id).toBe('string');
        });
        it('should only include airlines with valid IATA codes (filtered)', () => {
            const airlinesWithoutCodes = AIRLINES.filter(airline => !airline.iataCode || airline.iataCode === null || airline.iataCode === undefined);
            expect(airlinesWithoutCodes).toEqual([]);
        });
        it('should have airlines with 2-character IATA codes', () => {
            const airlinesWithInvalidCodes = AIRLINES.filter(airline => !airline.iataCode || airline.iataCode.length !== 2);
            expect(airlinesWithInvalidCodes).toEqual([]);
        });
        it('should have camelCase property names (transformed from snake_case)', () => {
            const airline = AIRLINES[0];
            // Check that camelCase properties exist
            expect(airline).toHaveProperty('iataCode');
            // Check that snake_case properties don't exist
            expect(airline).not.toHaveProperty('iata_code');
        });
        it('should have consistent data types across all airlines', () => {
            AIRLINES.slice(0, 10).forEach(airline => {
                expect(typeof airline.iataCode).toBe('string');
                expect(typeof airline.name).toBe('string');
                expect(typeof airline.id).toBe('string');
            });
        });
        it('should contain expected major airlines', () => {
            const majorAirlines = ['AA', 'BA', 'UA', 'LH', 'AF', 'DL'];
            majorAirlines.forEach(code => {
                const airline = AIRLINES.find(a => a.iataCode === code);
                expect(airline).toBeTruthy();
                expect(airline?.iataCode).toBe(code);
            });
        });
        it('should filter out airlines without IATA codes', () => {
            // All airlines in the final array should have valid IATA codes
            AIRLINES.forEach(airline => {
                expect(airline.iataCode).toBeTruthy();
                expect(airline.iataCode).not.toBe(null);
                expect(airline.iataCode).not.toBe(undefined);
                expect(airline.iataCode.length).toBe(2);
            });
        });
    });
    describe('AIRCRAFT data', () => {
        it('should load aircraft data as an array', () => {
            expect(Array.isArray(AIRCRAFT)).toBe(true);
            expect(AIRCRAFT.length).toBeGreaterThan(0);
        });
        it('should have aircraft with required properties', () => {
            const aircraft = AIRCRAFT[0];
            expect(aircraft).toHaveProperty('iataCode');
            expect(aircraft).toHaveProperty('name');
            expect(aircraft).toHaveProperty('id');
            expect(typeof aircraft.iataCode).toBe('string');
            expect(typeof aircraft.name).toBe('string');
            expect(typeof aircraft.id).toBe('string');
        });
        it('should have aircraft with valid IATA codes', () => {
            const aircraftWithInvalidCodes = AIRCRAFT.filter(aircraft => !aircraft.iataCode || aircraft.iataCode.length === 0 || aircraft.iataCode.length > 3);
            expect(aircraftWithInvalidCodes).toEqual([]);
        });
        it('should have camelCase property names (transformed from snake_case)', () => {
            const aircraft = AIRCRAFT[0];
            // Check that camelCase properties exist
            expect(aircraft).toHaveProperty('iataCode');
            // Check that snake_case properties don't exist
            expect(aircraft).not.toHaveProperty('iata_code');
        });
        it('should have consistent data types across all aircraft', () => {
            AIRCRAFT.slice(0, 10).forEach(aircraft => {
                expect(typeof aircraft.iataCode).toBe('string');
                expect(typeof aircraft.name).toBe('string');
                expect(typeof aircraft.id).toBe('string');
            });
        });
        it('should contain expected aircraft types', () => {
            const commonAircraft = ['737', '747', '777', '320', '330', 'A319'];
            commonAircraft.forEach(code => {
                const aircraft = AIRCRAFT.find(a => a.iataCode === code);
                expect(aircraft).toBeTruthy();
                expect(aircraft?.iataCode).toBe(code);
            });
        });
        it('should have Boeing aircraft in the dataset', () => {
            const boeingAircraft = AIRCRAFT.filter(aircraft => aircraft.name.toLowerCase().includes('boeing'));
            expect(boeingAircraft.length).toBeGreaterThan(0);
        });
        it('should have Airbus aircraft in the dataset', () => {
            const airbusAircraft = AIRCRAFT.filter(aircraft => aircraft.name.toLowerCase().includes('airbus'));
            expect(airbusAircraft.length).toBeGreaterThan(0);
        });
    });
    describe('Data consistency across modules', () => {
        it('should have unique IDs across all data types', () => {
            const airportIds = new Set(AIRPORTS.map(a => a.id));
            const airlineIds = new Set(AIRLINES.map(a => a.id));
            const aircraftIds = new Set(AIRCRAFT.map(a => a.id));
            expect(airportIds.size).toBe(AIRPORTS.length);
            expect(airlineIds.size).toBe(AIRLINES.length);
            expect(aircraftIds.size).toBe(AIRCRAFT.length);
        });
        it('should have unique IATA codes within each data type', () => {
            const airportCodes = new Set(AIRPORTS.map(a => a.iataCode));
            const airlineCodes = new Set(AIRLINES.map(a => a.iataCode));
            const aircraftCodes = new Set(AIRCRAFT.map(a => a.iataCode));
            expect(airportCodes.size).toBe(AIRPORTS.length);
            expect(airlineCodes.size).toBe(AIRLINES.length);
            expect(aircraftCodes.size).toBe(AIRCRAFT.length);
        });
        it('should load data synchronously without errors', () => {
            expect(() => {
                const airports = AIRPORTS.length;
                const airlines = AIRLINES.length;
                const aircraft = AIRCRAFT.length;
                expect(airports).toBeGreaterThan(0);
                expect(airlines).toBeGreaterThan(0);
                expect(aircraft).toBeGreaterThan(0);
            }).not.toThrow();
        });
        it('should have reasonable dataset sizes', () => {
            // Expect reasonable amounts of data
            expect(AIRPORTS.length).toBeGreaterThan(1000); // Should have many airports
            expect(AIRLINES.length).toBeGreaterThan(100); // Should have many airlines
            expect(AIRCRAFT.length).toBeGreaterThan(50); // Should have many aircraft types
        });
    });
});
