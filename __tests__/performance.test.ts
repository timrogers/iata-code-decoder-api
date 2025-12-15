import request from 'supertest';
import app from '../src/api.js';

describe('Performance Tests', () => {
  const iterations = 100;

  it('should handle airport lookups efficiently', async () => {
    const queries = ['L', 'LH', 'LHR', 'J', 'JF', 'JFK', 'A', 'AB', 'ABC'];

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      await request(app).get(`/airports?query=${query}`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`Airport lookups: ${iterations} requests in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms per request)`);

    // This is just a baseline measurement
    expect(totalTime).toBeLessThan(10000); // Should complete 100 requests in under 10 seconds
  });

  it('should handle airline lookups efficiently', async () => {
    const queries = ['A', 'AA', 'B', 'BA', 'U', 'UA'];

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      await request(app).get(`/airlines?query=${query}`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`Airline lookups: ${iterations} requests in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms per request)`);

    expect(totalTime).toBeLessThan(10000);
  });

  it('should handle aircraft lookups efficiently', async () => {
    const queries = ['7', '77', '777', 'A', 'A3', 'A32'];

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      await request(app).get(`/aircraft?query=${query}`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`Aircraft lookups: ${iterations} requests in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms per request)`);

    expect(totalTime).toBeLessThan(10000);
  });
});
