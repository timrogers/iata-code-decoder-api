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

  it('should only read airport data from disk once', async () => {
    jest.resetModules();
    const fs = await import('node:fs');
    const readFileSpy = jest.spyOn(fs, 'readFileSync');
    const { getAirports } = await import('../src/airports.js');
    getAirports();
    getAirports();

    const airportReads = readFileSpy.mock.calls.filter(([path]) =>
      String(path).includes('/data/airports.json'),
    );

    expect(airportReads).toHaveLength(1);
    readFileSpy.mockRestore();
  });

  it('should only read airline data from disk once', async () => {
    jest.resetModules();
    const fs = await import('node:fs');
    const readFileSpy = jest.spyOn(fs, 'readFileSync');
    const { getAirlines } = await import('../src/airlines.js');
    getAirlines();
    getAirlines();

    const airlineReads = readFileSpy.mock.calls.filter(([path]) =>
      String(path).includes('/data/airlines.json'),
    );

    expect(airlineReads).toHaveLength(1);
    readFileSpy.mockRestore();
  });

  it('should only read aircraft data from disk once', async () => {
    jest.resetModules();
    const fs = await import('node:fs');
    const readFileSpy = jest.spyOn(fs, 'readFileSync');
    const { getAircraft } = await import('../src/aircraft.js');
    getAircraft();
    getAircraft();

    const aircraftReads = readFileSpy.mock.calls.filter(([path]) =>
      String(path).includes('/data/aircraft.json'),
    );

    expect(aircraftReads).toHaveLength(1);
    readFileSpy.mockRestore();
  });
});
