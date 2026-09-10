import { createRequire } from 'node:module';
import { getAirports } from '../src/airports.js';
import { getAirlines } from '../src/airlines.js';
import { getAircraft } from '../src/aircraft.js';

const require = createRequire(import.meta.url);

const clearRequireCache = (modulePath: string): string => {
  const resolvedPath = require.resolve(modulePath);
  delete require.cache[resolvedPath];
  return resolvedPath;
};

describe('Data loaders', () => {
  it('should lazily load airport data on first access', () => {
    const airportsDataPath = clearRequireCache('../data/airports.json');

    expect(require.cache[airportsDataPath]).toBeUndefined();
    getAirports();
    expect(require.cache[airportsDataPath]).toBeDefined();
  });

  it('should lazily load airline data on first access', () => {
    const airlinesDataPath = clearRequireCache('../data/airlines.json');

    expect(require.cache[airlinesDataPath]).toBeUndefined();
    getAirlines();
    expect(require.cache[airlinesDataPath]).toBeDefined();
  });

  it('should lazily load aircraft data on first access', () => {
    const aircraftDataPath = clearRequireCache('../data/aircraft.json');

    expect(require.cache[aircraftDataPath]).toBeUndefined();
    getAircraft();
    expect(require.cache[aircraftDataPath]).toBeDefined();
  });

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
