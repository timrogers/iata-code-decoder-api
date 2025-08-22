// Mock the entire data loading modules before importing
jest.mock('../data/airlines.json', () => [
  {
    id: 'airline1',
    name: 'Test Airline 1',
    iata_code: 'TA',
  },
  {
    id: 'airline2', 
    name: 'Test Airline 2',
    iata_code: 'TB',
  },
  {
    id: 'airline3',
    name: 'Test Airline No IATA',
    iata_code: null,
  },
  {
    id: 'airline4',
    name: 'Test Airline Undefined IATA',
    // no iata_code property
  }
]);

import { AIRLINES } from '../src/airlines';

describe('Airlines', () => {
  describe('AIRLINES export', () => {
    it('should load and transform airline data correctly', () => {
      expect(AIRLINES).toBeDefined();
      expect(Array.isArray(AIRLINES)).toBe(true);
    });

    it('should convert snake_case keys to camelCase', () => {
      const airline = AIRLINES.find(a => a.id === 'airline1');
      expect(airline).toEqual({
        id: 'airline1',
        name: 'Test Airline 1',
        iataCode: 'TA',
      });
    });

    it('should filter out airlines without IATA codes', () => {
      // Should only include airlines with valid IATA codes
      expect(AIRLINES).toHaveLength(2);
      
      const airlineIds = AIRLINES.map(a => a.id);
      expect(airlineIds).toContain('airline1');
      expect(airlineIds).toContain('airline2');
      expect(airlineIds).not.toContain('airline3'); // null iata_code
      expect(airlineIds).not.toContain('airline4'); // undefined iata_code
    });

    it('should have correct structure for all airlines', () => {
      AIRLINES.forEach(airline => {
        expect(airline).toHaveProperty('id');
        expect(airline).toHaveProperty('name'); 
        expect(airline).toHaveProperty('iataCode');
        expect(typeof airline.id).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.iataCode).toBe('string');
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode).not.toBeUndefined();
      });
    });
  });
});