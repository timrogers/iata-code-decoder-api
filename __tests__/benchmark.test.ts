import { AIRPORTS, AIRPORTS_INDEX } from '../src/airports.js';
import { AIRLINES, AIRLINES_INDEX } from '../src/airlines.js';
import { AIRCRAFT, AIRCRAFT_INDEX } from '../src/aircraft.js';
import { Keyable } from '../src/types.js';

// Old implementation for comparison
const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

describe('Performance Benchmark', () => {
  const iterations = 10000;

  it('should measure improvement from indexed lookups', () => {
    console.log('\nPerformance Benchmark: Linear Search vs Indexed Lookup');
    console.log('='.repeat(60));
    console.log(`Airports count: ${AIRPORTS.length}`);
    console.log(`Airlines count: ${AIRLINES.length}`);
    console.log(`Aircraft count: ${AIRCRAFT.length}`);
    console.log('');

    const testCases = [
      {
        name: 'Airports prefix "L"',
        oldFn: () => filterObjectsByPartialIataCode(AIRPORTS, 'L', 3),
        newFn: () => AIRPORTS_INDEX.lookup('L'),
      },
      {
        name: 'Airports prefix "LH"',
        oldFn: () => filterObjectsByPartialIataCode(AIRPORTS, 'LH', 3),
        newFn: () => AIRPORTS_INDEX.lookup('LH'),
      },
      {
        name: 'Airports exact "LHR"',
        oldFn: () => filterObjectsByPartialIataCode(AIRPORTS, 'LHR', 3),
        newFn: () => AIRPORTS_INDEX.lookup('LHR'),
      },
      {
        name: 'Airlines prefix "A"',
        oldFn: () => filterObjectsByPartialIataCode(AIRLINES, 'A', 2),
        newFn: () => AIRLINES_INDEX.lookup('A'),
      },
      {
        name: 'Airlines exact "BA"',
        oldFn: () => filterObjectsByPartialIataCode(AIRLINES, 'BA', 2),
        newFn: () => AIRLINES_INDEX.lookup('BA'),
      },
      {
        name: 'Aircraft prefix "7"',
        oldFn: () => filterObjectsByPartialIataCode(AIRCRAFT, '7', 3),
        newFn: () => AIRCRAFT_INDEX.lookup('7'),
      },
      {
        name: 'Aircraft exact "777"',
        oldFn: () => filterObjectsByPartialIataCode(AIRCRAFT, '777', 3),
        newFn: () => AIRCRAFT_INDEX.lookup('777'),
      },
    ];

    console.log('Test Case                         Old (ms)    New (ms)    Speedup');
    console.log('-'.repeat(70));

    for (const test of testCases) {
      // Benchmark old implementation
      const oldStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        test.oldFn();
      }
      const oldEnd = performance.now();
      const oldAvg = (oldEnd - oldStart) / iterations;

      // Benchmark new implementation
      const newStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        test.newFn();
      }
      const newEnd = performance.now();
      const newAvg = (newEnd - newStart) / iterations;

      const speedup = oldAvg / newAvg;
      console.log(
        `${test.name.padEnd(32)} ${oldAvg.toFixed(4).padStart(10)} ${newAvg.toFixed(4).padStart(10)} ${speedup.toFixed(1).padStart(8)}x`,
      );

      // Verify both return the same results
      const oldResult = test.oldFn();
      const newResult = test.newFn();
      expect(newResult.length).toBe(oldResult.length);
    }

    console.log('');
    console.log('Note: Speedup > 1.0x means new implementation is faster');
  });
});
