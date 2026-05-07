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

  it('should preserve airport fields without generic key camelisation', () => {
    const airport = getAirports().find(({ iataCode }) => iataCode === 'ABI');

    expect(airport).toMatchObject({
      cityName: 'Abilene',
      iataCode: 'ABI',
      iataCountryCode: 'US',
      id: 'arp_abi_us',
      name: 'Abilene Regional Airport',
      timeZone: 'America/Chicago',
    });
    expect(airport?.city).toEqual({
      id: 'cit_abi_us',
      iataCode: 'ABI',
      iataCountryCode: 'US',
      name: 'Abilene',
    });
  });

  it('should cache airline data after first load', () => {
    const first = getAirlines();
    const second = getAirlines();

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first[0]).toHaveProperty('iataCode');
  });

  it('should only transform airlines with an IATA code', () => {
    const airline = getAirlines().find(({ iataCode }) => iataCode === 'BA');

    expect(airline).toMatchObject({
      iataCode: 'BA',
      name: 'British Airways',
    });
    expect(getAirlines().some(({ iataCode }) => iataCode === null)).toBe(false);
  });

  it('should cache aircraft data after first load', () => {
    const first = getAircraft();
    const second = getAircraft();

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
    expect(first[0]).toHaveProperty('iataCode');
  });

  it('should preserve aircraft fields without generic key camelisation', () => {
    const aircraft = getAircraft().find(({ iataCode }) => iataCode === '777');

    expect(aircraft).toEqual({
      iataCode: '777',
      id: 'arc_00009VMF8AhXSSRnQDI6HF',
      name: 'Boeing 777',
    });
  });
});
