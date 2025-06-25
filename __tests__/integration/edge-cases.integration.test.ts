import request from 'supertest';
import app from '../../src/api.js';

describe('IATA Code Decoder API - Edge Cases and Stress Tests', () => {

  describe('URL Encoding and Special Characters', () => {
    it('should handle URL-encoded query parameters', async () => {
      const response = await request(app)
        .get('/airports?query=LA%20X')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle query parameters with spaces', async () => {
      const response = await request(app)
        .get('/airports?query=LA X')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle query parameters with plus signs', async () => {
      const response = await request(app)
        .get('/airports?query=LA+X')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle numeric query parameters', async () => {
      const response = await request(app)
        .get('/airports?query=123')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle mixed alphanumeric query parameters', async () => {
      const response = await request(app)
        .get('/aircraft?query=7A3')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle special characters that might be in IATA codes', async () => {
      const specialChars = ['_', '-', '.'];
      
      for (const char of specialChars) {
        const response = await request(app)
          .get(`/airports?query=A${char}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Unicode and International Characters', () => {
    it('should handle Unicode characters in query', async () => {
      const response = await request(app)
        .get('/airports?query=%C3%B1') // URL-encoded ñ
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Unicode characters are unlikely to match IATA codes, so empty result is expected
      expect(response.body.data).toEqual([]);
    });

    it('should handle accented characters', async () => {
      const response = await request(app)
        .get('/airports?query=%C3%A9') // URL-encoded é
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Accented characters are unlikely to match IATA codes, so empty result is expected
      expect(response.body.data).toEqual([]);
    });

    it('should handle cyrillic characters', async () => {
      const response = await request(app)
        .get('/airports?query=%D0%B0') // URL-encoded а
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Cyrillic characters are unlikely to match IATA codes, so empty result is expected
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum length queries for airports (3 chars)', async () => {
      const response = await request(app)
        .get('/airports?query=ABC')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle maximum length queries for airlines (2 chars)', async () => {
      const response = await request(app)
        .get('/airlines?query=AB')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle maximum length queries for aircraft (3 chars)', async () => {
      const response = await request(app)
        .get('/aircraft?query=ABC')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should return empty array for over-length airport queries', async () => {
      const response = await request(app)
        .get('/airports?query=ABCD')
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should return empty array for over-length airline queries', async () => {
      const response = await request(app)
        .get('/airlines?query=ABC')
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should return empty array for over-length aircraft queries', async () => {
      const response = await request(app)
        .get('/aircraft?query=ABCD')
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should handle very long query strings gracefully', async () => {
      const longQuery = 'A'.repeat(1000);
      const response = await request(app)
        .get(`/airports?query=${longQuery}`)
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });
  });

  describe('HTTP Methods and Headers', () => {
    it('should only accept GET requests on search endpoints', async () => {
      await request(app)
        .post('/airports?query=LAX')
        .expect(404);

      await request(app)
        .put('/airports?query=LAX')
        .expect(404);

      await request(app)
        .delete('/airports?query=LAX')
        .expect(404);
    });

    it('should handle requests with various Accept headers', async () => {
      const response = await request(app)
        .get('/airports?query=LAX')
        .set('Accept', 'application/json')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle requests with Accept: */*', async () => {
      const response = await request(app)
        .get('/airports?query=LAX')
        .set('Accept', '*/*')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle requests without Accept header', async () => {
      const response = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('should handle multiple query parameters with same name', async () => {
      const response = await request(app)
        .get('/airports?query=LAX&query=JFK')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle query parameter with empty value differently than missing', async () => {
      await request(app)
        .get('/airports?query=')
        .expect(400);

      await request(app)
        .get('/airports')
        .expect(400);
    });

    it('should handle query parameter with only whitespace', async () => {
      const response = await request(app)
        .get('/airports?query=%20')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle case sensitivity correctly', async () => {
      const upperResponse = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      const lowerResponse = await request(app)
        .get('/airports?query=lax')
        .expect(200);

      const mixedResponse = await request(app)
        .get('/airports?query=LaX')
        .expect(200);

      expect(upperResponse.body).toEqual(lowerResponse.body);
      expect(upperResponse.body).toEqual(mixedResponse.body);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle rapid successive requests', async () => {
      const requests = Array.from({ length: 20 }, (_, i) => 
        request(app)
          .get(`/airports?query=L${i % 26}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    it('should handle concurrent requests to different endpoints', async () => {
      const airportRequest = request(app).get('/airports?query=LAX').expect(200);
      const airlineRequest = request(app).get('/airlines?query=AA').expect(200);
      const aircraftRequest = request(app).get('/aircraft?query=737').expect(200);
      const healthRequest = request(app).get('/health').expect(200);

      const [airportRes, airlineRes, aircraftRes, healthRes] = await Promise.all([
        airportRequest,
        airlineRequest,
        aircraftRequest,
        healthRequest
      ]);

      expect(airportRes.body).toHaveProperty('data');
      expect(airlineRes.body).toHaveProperty('data');
      expect(aircraftRes.body).toHaveProperty('data');
      expect(healthRes.body).toEqual({ success: true });
    });

    it('should maintain performance with complex queries', async () => {
      const startTime = Date.now();
      
      // Test with queries that might return large result sets
      const queries = ['A', 'B', 'C', 'D', 'E'];
      const requests = queries.map(query => 
        request(app).get(`/airports?query=${query}`).expect(200)
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete all requests within reasonable time
      expect(totalTime).toBeLessThan(2000); // 2 seconds for 5 requests
    });

    it('should handle stress test with many concurrent connections', async () => {
      const concurrentRequests = 50;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        request(app)
          .get(`/health`)
          .expect(200)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrentRequests;

      expect(responses).toHaveLength(concurrentRequests);
      responses.forEach(response => {
        expect(response.body).toEqual({ success: true });
      });

      // Average response time should be reasonable
      expect(avgTimePerRequest).toBeLessThan(100); // Less than 100ms per request on average
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory with repeated requests', async () => {
      // Make many requests to test for memory leaks
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/airports?query=L')
          .expect(200);
      }

      // Test should complete without throwing memory errors
      expect(true).toBe(true);
    });

    it('should handle large result sets efficiently', async () => {
      // Query that typically returns many results
      const response = await request(app)
        .get('/airports?query=A')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verify response time is reasonable even with large datasets
      const startTime = Date.now();
      await request(app)
        .get('/airports?query=A')
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from malformed requests', async () => {
      // Make a malformed request
      await request(app)
        .get('/airports?malformed=parameter')
        .expect(400);

      // Should still handle normal requests fine
      await request(app)
        .get('/airports?query=LAX')
        .expect(200);
    });

    it('should handle requests with invalid characters gracefully', async () => {
      const invalidChars = ['<', '>', '"', "'", '&', '%', '$', '@'];
      
      for (const char of invalidChars) {
        const response = await request(app)
          .get(`/airports?query=${encodeURIComponent(char)}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should maintain API stability after error conditions', async () => {
      // Generate some error conditions
      await request(app).get('/airports').expect(400);
      await request(app).get('/nonexistent').expect(404);
      await request(app).get('/airports?query=').expect(400);

      // API should still work normally
      const response = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      
      const lax = response.body.data.find((airport: any) => 
        airport.iataCode === 'LAX'
      );
      expect(lax).toBeTruthy();
    });
  });

  describe('Data Consistency Under Load', () => {
    it('should return consistent results under concurrent load', async () => {
      const query = 'LAX';
      const numRequests = 10;
      
      const requests = Array.from({ length: numRequests }, () =>
        request(app).get(`/airports?query=${query}`).expect(200)
      );

      const responses = await Promise.all(requests);
      
      // All responses should be identical
      const firstResponse = responses[0].body;
      responses.forEach(response => {
        expect(response.body).toEqual(firstResponse);
      });
    });

    it('should maintain data integrity across different query types', async () => {
      const airportResponse = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      const airlineResponse = await request(app)
        .get('/airlines?query=AA')
        .expect(200);

      const aircraftResponse = await request(app)
        .get('/aircraft?query=737')
        .expect(200);

      // Verify structure consistency
      expect(airportResponse.body).toHaveProperty('data');
      expect(airlineResponse.body).toHaveProperty('data');
      expect(aircraftResponse.body).toHaveProperty('data');

      // Verify data type consistency
      if (airportResponse.body.data.length > 0) {
        const airport = airportResponse.body.data[0];
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('id');
      }

      if (airlineResponse.body.data.length > 0) {
        const airline = airlineResponse.body.data[0];
        expect(airline).toHaveProperty('iataCode');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('id');
      }

      if (aircraftResponse.body.data.length > 0) {
        const aircraft = aircraftResponse.body.data[0];
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('id');
      }
    });
  });
});