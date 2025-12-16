import { AIRLINES } from '../src/airlines.js';

describe('AIRLINES data', () => {
  it('camelises airline properties', () => {
    const airline = AIRLINES[0];

    expect(airline).toHaveProperty('iataCode');
    expect(airline).not.toHaveProperty('iata_code');
  });

  it('excludes airlines without an IATA code', () => {
    const airlineWithoutCode = AIRLINES.find(
      (airline) => airline.id === 'arl_0000AhuaUosHAnMAMZFYrg',
    );

    expect(airlineWithoutCode).toBeUndefined();
    expect(AIRLINES.every((airline) => !!airline.iataCode)).toBe(true);
  });
});
