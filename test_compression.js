import zlib from 'zlib';
import { promisify } from 'util';
import { AIRPORTS } from './src/airports.js';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

console.log('\n=== Testing Compression Strategies ===\n');

// Test different response sizes
const testCases = [
  { name: 'Single result', data: AIRPORTS.slice(0, 1) },
  { name: '10 results', data: AIRPORTS.slice(0, 10) },
  { name: '100 results', data: AIRPORTS.slice(0, 100) },
  { name: '500 results (single char query)', data: AIRPORTS.slice(0, 500) },
  { name: 'All airports', data: AIRPORTS },
];

for (const testCase of testCases) {
  const json = JSON.stringify({ data: testCase.data });
  const uncompressed = Buffer.from(json);
  
  const gzipped = await gzip(uncompressed);
  const brotlied = await brotli(uncompressed);
  
  const gzipRatio = ((1 - gzipped.length / uncompressed.length) * 100).toFixed(1);
  const brotliRatio = ((1 - brotlied.length / uncompressed.length) * 100).toFixed(1);
  
  console.log(`${testCase.name}:`);
  console.log(`  Uncompressed: ${(uncompressed.length / 1024).toFixed(2)} KB`);
  console.log(`  Gzip: ${(gzipped.length / 1024).toFixed(2)} KB (${gzipRatio}% reduction)`);
  console.log(`  Brotli: ${(brotlied.length / 1024).toFixed(2)} KB (${brotliRatio}% reduction)`);
  console.log('');
}
