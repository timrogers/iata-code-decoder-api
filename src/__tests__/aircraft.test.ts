import { AIRCRAFT } from '../aircraft.js';
import { Aircraft } from '../types.js';

// Mock the JSON data to avoid loading large files in tests
jest.mock('../../data/aircraft.json', () => [
  {
    iata_code: '737',
    id: 'boeing_737',
    name: 'Boeing 737',
  },
  {
    iata_code: '777',
    id: 'boeing_777',
    name: 'Boeing 777',
  },
  {
    iata_code: 'A380',
    id: 'airbus_a380',
    name: 'Airbus A380',
  },
  {
    iata_code: 'A320',
    id: 'airbus_a320',
    name: 'Airbus A320',
  },
  {
    iata_code: 'E90',
    id: 'embraer_e190',
    name: 'Embraer E190',
  },
], { virtual: true });

describe('Aircraft', () => {
  describe('AIRCRAFT export', () => {
    it('should export an array of aircraft', () => {
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should have properly camelized keys for all aircraft', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('id');
        expect(aircraft).toHaveProperty('name');

        // Should not have snake_case keys
        expect(aircraft).not.toHaveProperty('iata_code');
      });
    });

    it('should include expected aircraft models', () => {
      const boeing737 = AIRCRAFT.find(aircraft => aircraft.iataCode === '737');
      const boeing777 = AIRCRAFT.find(aircraft => aircraft.iataCode === '777');
      const airbusA380 = AIRCRAFT.find(aircraft => aircraft.iataCode === 'A380');
      const airbusA320 = AIRCRAFT.find(aircraft => aircraft.iataCode === 'A320');
      const embraerE190 = AIRCRAFT.find(aircraft => aircraft.iataCode === 'E90');

      expect(boeing737).toBeDefined();
      expect(boeing737?.name).toBe('Boeing 737');
      expect(boeing737?.id).toBe('boeing_737');

      expect(boeing777).toBeDefined();
      expect(boeing777?.name).toBe('Boeing 777');
      expect(boeing777?.id).toBe('boeing_777');

      expect(airbusA380).toBeDefined();
      expect(airbusA380?.name).toBe('Airbus A380');
      expect(airbusA380?.id).toBe('airbus_a380');

      expect(airbusA320).toBeDefined();
      expect(airbusA320?.name).toBe('Airbus A320');
      expect(airbusA320?.id).toBe('airbus_a320');

      expect(embraerE190).toBeDefined();
      expect(embraerE190?.name).toBe('Embraer E190');
      expect(embraerE190?.id).toBe('embraer_e190');
    });

    it('should maintain correct data types', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(typeof aircraft.iataCode).toBe('string');
        expect(typeof aircraft.id).toBe('string');
        expect(typeof aircraft.name).toBe('string');
      });
    });

    it('should have valid IATA codes', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft.iataCode.length).toBeGreaterThanOrEqual(2);
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(4);
        expect(aircraft.iataCode).toMatch(/^[A-Z0-9]+$/);
      });
    });

    it('should have unique IATA codes', () => {
      const iataCodes = AIRCRAFT.map(aircraft => aircraft.iataCode);
      const uniqueIataCodes = [...new Set(iataCodes)];
      expect(iataCodes).toHaveLength(uniqueIataCodes.length);
    });

    it('should have unique IDs', () => {
      const ids = AIRCRAFT.map(aircraft => aircraft.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('should have non-empty names', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft.name).toBeTruthy();
        expect(aircraft.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty IDs', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft.id).toBeTruthy();
        expect(aircraft.id.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty IATA codes', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft.iataCode).toBeTruthy();
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
      });
    });

    it('should include both numeric and alphanumeric IATA codes', () => {
      const numericCodes = AIRCRAFT.filter(aircraft => /^\d+$/.test(aircraft.iataCode));
      const alphanumericCodes = AIRCRAFT.filter(aircraft => /^[A-Z]\d+$/.test(aircraft.iataCode));
      const mixedCodes = AIRCRAFT.filter(aircraft => /^[A-Z0-9]+$/.test(aircraft.iataCode) && !/^\d+$/.test(aircraft.iataCode) && !/^[A-Z]\d+$/.test(aircraft.iataCode));

      // Should have at least some numeric codes (like '737', '777')
      expect(numericCodes.length).toBeGreaterThan(0);

      // Should have at least some alphanumeric codes (like 'A380', 'A320')
      expect(alphanumericCodes.length).toBeGreaterThan(0);
    });

    it('should have expected length of 5 aircraft', () => {
      expect(AIRCRAFT).toHaveLength(5);
    });
  });
});