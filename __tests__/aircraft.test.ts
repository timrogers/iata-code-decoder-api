// Mock the entire data loading modules before importing
jest.mock('../data/aircraft.json', () => [
  {
    id: 'aircraft1',
    name: 'Boeing 737-800',
    iata_code: '738',
  },
  {
    id: 'aircraft2',
    name: 'Airbus A320',
    iata_code: '320',
  },
  {
    id: 'aircraft3',
    name: 'Boeing 777-300ER',
    iata_code: '77W',
  }
]);

import { AIRCRAFT } from '../src/aircraft';

describe('Aircraft', () => {
  describe('AIRCRAFT export', () => {
    it('should load and transform aircraft data correctly', () => {
      expect(AIRCRAFT).toBeDefined();
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT).toHaveLength(3);
    });

    it('should convert snake_case keys to camelCase', () => {
      const aircraft = AIRCRAFT.find(a => a.id === 'aircraft1');
      expect(aircraft).toEqual({
        id: 'aircraft1',
        name: 'Boeing 737-800',
        iataCode: '738',
      });
    });

    it('should include all aircraft from data (no filtering)', () => {
      // Unlike airlines, aircraft doesn't filter out entries
      expect(AIRCRAFT).toHaveLength(3);
      
      const aircraftIds = AIRCRAFT.map(a => a.id);
      expect(aircraftIds).toContain('aircraft1');
      expect(aircraftIds).toContain('aircraft2');
      expect(aircraftIds).toContain('aircraft3');
    });

    it('should have correct structure for all aircraft', () => {
      AIRCRAFT.forEach(aircraft => {
        expect(aircraft).toHaveProperty('id');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('iataCode');
        expect(typeof aircraft.id).toBe('string');
        expect(typeof aircraft.name).toBe('string');
        expect(typeof aircraft.iataCode).toBe('string');
      });
    });

    it('should preserve all original data after transformation', () => {
      const expectedData = [
        { id: 'aircraft1', name: 'Boeing 737-800', iataCode: '738' },
        { id: 'aircraft2', name: 'Airbus A320', iataCode: '320' },
        { id: 'aircraft3', name: 'Boeing 777-300ER', iataCode: '77W' }
      ];
      
      expect(AIRCRAFT).toEqual(expectedData);
    });
  });
});