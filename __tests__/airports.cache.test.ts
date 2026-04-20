import { getAirports } from '../src/airports.js';

describe('getAirports', () => {
  it('returns the same cached array instance across calls', () => {
    const first = getAirports();
    const second = getAirports();

    expect(second).toBe(first);
    expect(Array.isArray(first)).toBe(true);
    expect(first.length).toBeGreaterThan(0);
  });
});
