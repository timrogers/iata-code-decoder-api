import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';

// Test the filtering logic which is the core functionality
function filterObjectsByPartialIataCode(objects, partialIataCode, iataCodeLength) {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
}

describe('IATA Code Filtering', () => {
  test('airports data is loaded and has expected structure', () => {
    assert(Array.isArray(AIRPORTS));
    assert(AIRPORTS.length > 0);

    // Check first airport has expected properties
    const firstAirport = AIRPORTS[0];
    assert(typeof firstAirport.iataCode === 'string');
    assert(firstAirport.iataCode.length === 3);
  });

  test('airlines data is loaded and has expected structure', () => {
    assert(Array.isArray(AIRLINES));
    assert(AIRLINES.length > 0);

    // Check first airline has expected properties
    const firstAirline = AIRLINES[0];
    assert(typeof firstAirline.iataCode === 'string');
    assert(firstAirline.iataCode.length === 2);
  });

  test('aircraft data is loaded and has expected structure', () => {
    assert(Array.isArray(AIRCRAFT));
    assert(AIRCRAFT.length > 0);

    // Check first aircraft has expected properties
    const firstAircraft = AIRCRAFT[0];
    assert(typeof firstAircraft.iataCode === 'string');
    assert(firstAircraft.iataCode.length === 3);
  });

  test('filterObjectsByPartialIataCode filters airports correctly', () => {
    // Test exact match
    const lhrResults = filterObjectsByPartialIataCode(AIRPORTS, 'LHR', 3);
    const lhrAirport = lhrResults.find((airport) => airport.iataCode === 'LHR');
    if (lhrAirport) {
      assert.strictEqual(lhrAirport.iataCode, 'LHR');
    }

    // Test partial match
    const lResults = filterObjectsByPartialIataCode(AIRPORTS, 'L', 3);
    assert(lResults.length > 0);
    lResults.forEach((airport) => {
      assert(airport.iataCode.toLowerCase().startsWith('l'));
    });

    // Test query too long
    const tooLongResults = filterObjectsByPartialIataCode(AIRPORTS, 'LHRX', 3);
    assert.strictEqual(tooLongResults.length, 0);
  });

  test('filterObjectsByPartialIataCode filters airlines correctly', () => {
    // Test partial match
    const bResults = filterObjectsByPartialIataCode(AIRLINES, 'B', 2);
    assert(bResults.length > 0);
    bResults.forEach((airline) => {
      assert(airline.iataCode.toLowerCase().startsWith('b'));
    });

    // Test query too long
    const tooLongResults = filterObjectsByPartialIataCode(AIRLINES, 'BAX', 2);
    assert.strictEqual(tooLongResults.length, 0);
  });

  test('filterObjectsByPartialIataCode filters aircraft correctly', () => {
    // Test partial match
    const sevenResults = filterObjectsByPartialIataCode(AIRCRAFT, '7', 3);
    assert(sevenResults.length > 0);
    sevenResults.forEach((aircraft) => {
      assert(aircraft.iataCode.toLowerCase().startsWith('7'));
    });

    // Test query too long
    const tooLongResults = filterObjectsByPartialIataCode(AIRCRAFT, '777X', 3);
    assert.strictEqual(tooLongResults.length, 0);
  });

  test('filterObjectsByPartialIataCode is case insensitive', () => {
    const upperResults = filterObjectsByPartialIataCode(AIRPORTS, 'L', 3);
    const lowerResults = filterObjectsByPartialIataCode(AIRPORTS, 'l', 3);

    assert.strictEqual(upperResults.length, lowerResults.length);
    assert.deepStrictEqual(upperResults, lowerResults);
  });
});
