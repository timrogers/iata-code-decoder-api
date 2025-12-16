import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';
import { Keyable } from '../src/types.js';

const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase())
    );
  }
};

describe('Performance Benchmark', () => {
  const iterations = 10000;

  it('should measure baseline lookup performance', () => {
    console.log('\\nBaseline Performance Benchmark');
    console.log('='.repeat(60));
    console.log(`Airports count: ${AIRPORTS.length}`);
    console.log(`Airlines count: ${AIRLINES.length}`);
    console.log(`Aircraft count: ${AIRCRAFT.length}`);
    console.log('');

    const testQueries = [
      { collection: AIRPORTS, query: 'L', length: 3, name: 'Airports prefix "L"' },
      { collection: AIRPORTS, query: 'LH', length: 3, name: 'Airports prefix "LH"' },
      { collection: AIRPORTS, query: 'LHR', length: 3, name: 'Airports exact "LHR"' },
      { collection: AIRLINES, query: 'A', length: 2, name: 'Airlines prefix "A"' },
      { collection: AIRLINES, query: 'BA', length: 2, name: 'Airlines exact "BA"' },
      { collection: AIRCRAFT, query: '7', length: 3, name: 'Aircraft prefix "7"' },
      { collection: AIRCRAFT, query: '777', length: 3, name: 'Aircraft exact "777"' },
    ];

    for (const test of testQueries) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        filterObjectsByPartialIataCode(test.collection, test.query, test.length);
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;
      console.log(`${test.name}: ${avgTime.toFixed(4)} ms avg (${iterations} iterations)`);
    }

    expect(true).toBe(true);
  });
});
