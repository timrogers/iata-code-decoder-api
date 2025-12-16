import { filterObjectsByPartialIataCode } from '../src/api.js';
import { Keyable } from '../src/types.js';

describe('filterObjectsByPartialIataCode', () => {
  const sampleObjects: Keyable[] = [
    { iataCode: 'LHR', name: 'Heathrow' },
    { iataCode: 'LGW', name: 'Gatwick' },
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport' },
  ];

  it('returns an empty array when the query is longer than the IATA code length', () => {
    const result = filterObjectsByPartialIataCode(sampleObjects, 'LONG', 3);

    expect(result).toEqual([]);
  });

  it('performs a case-insensitive prefix match', () => {
    const result = filterObjectsByPartialIataCode(sampleObjects, 'lh', 3);

    expect(result).toEqual([{ iataCode: 'LHR', name: 'Heathrow' }]);
  });

  it('allows partial matches up to the specified IATA code length', () => {
    const result = filterObjectsByPartialIataCode(sampleObjects, 'L', 3);

    expect(result).toEqual([
      { iataCode: 'LHR', name: 'Heathrow' },
      { iataCode: 'LGW', name: 'Gatwick' },
    ]);
  });
});
