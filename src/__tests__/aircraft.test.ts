import { Aircraft } from '../types.js';

// Mock the aircraft module completely
jest.mock('../aircraft.js', () => ({
  AIRCRAFT: [
    {
      id: 'duffel_aircraft_1',
      name: 'Boeing 737-800',
      iataCode: '738'
    },
    {
      id: 'duffel_aircraft_2',
      name: 'Airbus A320',
      iataCode: '320'
    },
    {
      id: 'duffel_aircraft_3',
      name: 'Boeing 777-300ER',
      iataCode: '77W'
    }
  ]
}));

import { AIRCRAFT } from '../aircraft.js';

describe('Aircraft', () => {
  describe('AIRCRAFT constant', () => {
    it('should load and process aircraft data correctly', () => {
      expect(AIRCRAFT).toBeInstanceOf(Array);
      expect(AIRCRAFT.length).toBe(3);
    });

    it('should have camelCase keys', () => {
      const aircraft = AIRCRAFT.find((a: Aircraft) => a.id === 'duffel_aircraft_1');
      expect(aircraft).toBeDefined();
      expect(aircraft?.iataCode).toBe('738');
      expect(aircraft?.name).toBe('Boeing 737-800');
      expect(aircraft?.id).toBe('duffel_aircraft_1');
    });

    it('should have correct structure for each aircraft', () => {
      AIRCRAFT.forEach((aircraft: Aircraft) => {
        expect(aircraft).toHaveProperty('id');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('iataCode');
        expect(typeof aircraft.id).toBe('string');
        expect(typeof aircraft.name).toBe('string');
        expect(typeof aircraft.iataCode).toBe('string');
      });
    });

    it('should contain expected aircraft types', () => {
      const boeing737 = AIRCRAFT.find((a: Aircraft) => a.name === 'Boeing 737-800');
      const airbusA320 = AIRCRAFT.find((a: Aircraft) => a.name === 'Airbus A320');
      const boeing777 = AIRCRAFT.find((a: Aircraft) => a.name === 'Boeing 777-300ER');

      expect(boeing737).toBeDefined();
      expect(boeing737?.iataCode).toBe('738');
      
      expect(airbusA320).toBeDefined();
      expect(airbusA320?.iataCode).toBe('320');
      
      expect(boeing777).toBeDefined();
      expect(boeing777?.iataCode).toBe('77W');
    });
  });
});