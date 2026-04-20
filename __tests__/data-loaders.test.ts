import { getAirports } from '../src/airports.js';
import { getAirlines } from '../src/airlines.js';
import { getAircraft } from '../src/aircraft.js';

describe('Data loaders', () => {
  it('should cache airport data after first load', () => {
    const first = getAirports();
    const second = getAirports();

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first[0]).toHaveProperty('iataCode');
  });

  it('should cache airline data after first load', () => {
    const first = getAirlines();
    const second = getAirlines();

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first[0]).toHaveProperty('iataCode');
  });

  it('should cache aircraft data after first load', () => {
    const first = getAircraft();
    const second = getAircraft();

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first[0]).toHaveProperty('iataCode');
  });
});
