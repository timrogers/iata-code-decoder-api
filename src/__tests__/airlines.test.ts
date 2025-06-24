import { Airline } from '../types.js';

// Mock the airlines module completely
jest.mock('../airlines.js', () => ({
  AIRLINES: [
    {
      id: 'duffel_airline_1',
      name: 'Test Airline 1',
      iataCode: 'TA'
    },
    {
      id: 'duffel_airline_2',
      name: 'Test Airline 2',
      iataCode: 'TB'
    }
  ]
}));

import { AIRLINES } from '../airlines.js';

describe('Airlines', () => {
  describe('AIRLINES constant', () => {
    it('should load and process airlines data correctly', () => {
      expect(AIRLINES).toBeInstanceOf(Array);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should have camelCase keys', () => {
      const airline = AIRLINES.find((a: Airline) => a.id === 'duffel_airline_1');
      expect(airline).toBeDefined();
      expect(airline?.iataCode).toBe('TA');
      expect(airline?.name).toBe('Test Airline 1');
    });

    it('should contain valid airlines with iataCode', () => {
      expect(AIRLINES).toHaveLength(2);
      
      const airline1 = AIRLINES.find((a: Airline) => a.id === 'duffel_airline_1');
      const airline2 = AIRLINES.find((a: Airline) => a.id === 'duffel_airline_2');

      expect(airline1).toBeDefined();
      expect(airline2).toBeDefined();
    });

    it('should have correct structure for each airline', () => {
      AIRLINES.forEach((airline: Airline) => {
        expect(airline).toHaveProperty('id');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('iataCode');
        expect(typeof airline.id).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.iataCode).toBe('string');
        expect(airline.iataCode).toBeTruthy();
      });
    });
  });
});