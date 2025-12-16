import { AIRCRAFT } from '../src/aircraft.js';

describe('AIRCRAFT data', () => {
  it('camelises aircraft properties', () => {
    const aircraft = AIRCRAFT[0];

    expect(aircraft).toHaveProperty('iataCode');
    expect(aircraft).toHaveProperty('name');
    expect(aircraft).not.toHaveProperty('iata_code');
  });

  it('retains expected known aircraft entry', () => {
    const gulfstream = AIRCRAFT.find(
      (aircraft) => aircraft.id === 'arc_00009oBdrPis4D1mAnklmE',
    );

    expect(gulfstream).toEqual({
      iataCode: 'GJ2',
      name: 'Gulfstream Aerospace G-1159 Gulfstream II',
      id: 'arc_00009oBdrPis4D1mAnklmE',
    });
  });
});
