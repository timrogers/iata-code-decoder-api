
import { AIRPORTS } from './src/airports.js';
import { Keyable } from './src/types.js';

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

const iterations = 10000;
const queries = ['L', 'LH', 'LHR', 'JFK', 'A', 'B', 'C', 'Z', 'SFO', 'DXB'];

console.time('current_filtering (10k iterations)');
for (let i = 0; i < iterations; i++) {
  for (const query of queries) {
    filterObjectsByPartialIataCode(AIRPORTS, query, 3);
  }
}
console.timeEnd('current_filtering (10k iterations)');

const createPrefixMap = (objects: Keyable[]) => {
  const map = new Map<string, Keyable[]>();
  for (const obj of objects) {
    const code = obj.iataCode.toLowerCase();
    for (let i = 1; i <= code.length; i++) {
      const prefix = code.substring(0, i);
      if (!map.has(prefix)) {
        map.set(prefix, []);
      }
      map.get(prefix)!.push(obj);
    }
  }
  return map;
};

const airportPrefixMap = createPrefixMap(AIRPORTS);

console.time('prefix_map_lookup (10k iterations)');
for (let i = 0; i < iterations; i++) {
  for (const query of queries) {
    const result = airportPrefixMap.get(query.toLowerCase()) || [];
  }
}
console.timeEnd('prefix_map_lookup (10k iterations)');
