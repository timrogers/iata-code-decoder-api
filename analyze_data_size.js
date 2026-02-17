import { AIRPORTS } from './src/airports.js';
import { AIRLINES } from './src/airlines.js';
import { AIRCRAFT } from './src/aircraft.js';

console.log('\n=== Data Analysis ===\n');

// Calculate serialized sizes
const airportsJson = JSON.stringify({ data: AIRPORTS });
const airlinesJson = JSON.stringify({ data: AIRLINES });
const aircraftJson = JSON.stringify({ data: AIRCRAFT });

console.log('Serialized Response Sizes:');
console.log(`All airports (${AIRPORTS.length} items): ${(airportsJson.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`All airlines (${AIRLINES.length} items): ${(airlinesJson.length / 1024).toFixed(2)} KB`);
console.log(`All aircraft (${AIRCRAFT.length} items): ${(aircraftJson.length / 1024).toFixed(2)} KB`);

// Analyze query distribution
const airportCodeDistribution = {};
AIRPORTS.forEach(airport => {
  const firstChar = airport.iataCode.charAt(0).toUpperCase();
  airportCodeDistribution[firstChar] = (airportCodeDistribution[firstChar] || 0) + 1;
});

console.log('\nAirport code distribution by first letter (top 10):');
const sorted = Object.entries(airportCodeDistribution)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
sorted.forEach(([letter, count]) => {
  console.log(`  ${letter}: ${count} airports`);
});

// Check for nested city objects
const airportsWithCity = AIRPORTS.filter(a => a.city !== null).length;
console.log(`\nAirports with nested city objects: ${airportsWithCity} (${((airportsWithCity/AIRPORTS.length)*100).toFixed(1)}%)`);

// Sample airport record size
const sampleAirport = JSON.stringify(AIRPORTS[0]);
console.log(`\nAverage airport record size: ~${sampleAirport.length} bytes`);

