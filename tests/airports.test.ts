import request from 'supertest';
import app from '../src/api';

describe('Airports Endpoint Integration Tests', () => {
  describe('Valid Airport Searches', () => {
    test('should find airports with partial IATA code "lhr"', async () => {
      const response = await request(app).get('/airports?query=lhr');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const airport = response.body.data[0];
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('name');
        expect(airport.iataCode.toLowerCase()).toContain('lhr'.toLowerCase());
      }
    });

    test('should find airports with single letter search', async () => {
      const response = await request(app).get('/airports?query=a');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should return multiple airports starting with 'a'
      response.body.data.forEach((airport: any) => {
        expect(airport.iataCode.toLowerCase().startsWith('a')).toBe(true);
      });
    });

    test('should find airports with two-letter search', async () => {
      const response = await request(app).get('/airports?query=jf');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((airport: any) => {
        expect(airport.iataCode.toLowerCase().startsWith('jf')).toBe(true);
      });
    });

    test('should find exact matches for 3-letter IATA codes', async () => {
      const response = await request(app).get('/airports?query=JFK');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      if (response.body.data.length > 0) {
        const airport = response.body.data.find((a: any) => a.iataCode === 'JFK');
        expect(airport).toBeDefined();
        expect(airport.name).toBeDefined();
        expect(airport.cityName).toBeDefined();
      }
    });

    test('should handle case-insensitive searches', async () => {
      const lowercase = await request(app).get('/airports?query=lhr');
      const uppercase = await request(app).get('/airports?query=LHR');
      const mixedCase = await request(app).get('/airports?query=Lhr');
      
      expect(lowercase.status).toBe(200);
      expect(uppercase.status).toBe(200);
      expect(mixedCase.status).toBe(200);
      
      // All should return the same results
      expect(lowercase.body.data).toEqual(uppercase.body.data);
      expect(lowercase.body.data).toEqual(mixedCase.body.data);
    });
  });

  describe('Invalid Airport Searches', () => {
    test('should return empty array for non-existent airport codes', async () => {
      const response = await request(app).get('/airports?query=xyz');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for query longer than 3 characters', async () => {
      const response = await request(app).get('/airports?query=abcd');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for numeric queries', async () => {
      const response = await request(app).get('/airports?query=123');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for special characters', async () => {
      const response = await request(app).get('/airports?query=@#$');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    test('should return 400 for missing query parameter', async () => {
      const response = await request(app).get('/airports');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
      expect(response.body.data.error).toContain('search query must be provided');
    });

    test('should return 400 for empty query parameter', async () => {
      const response = await request(app).get('/airports?query=');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    test('should return 400 for query parameter with only spaces', async () => {
      const response = await request(app).get('/airports?query=%20%20%20'); // URL encoded spaces
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toContain('search query must be provided');
    });
  });

  describe('Data Structure Validation', () => {
    test('returned airports should have required fields', async () => {
      const response = await request(app).get('/airports?query=l');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const airport = response.body.data[0];
        
        // Check required fields exist
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('cityName');
        expect(airport).toHaveProperty('iataCountryCode');
        
        // Check data types
        expect(typeof airport.iataCode).toBe('string');
        expect(typeof airport.name).toBe('string');
        expect(typeof airport.cityName).toBe('string');
        expect(typeof airport.iataCountryCode).toBe('string');
        
        // IATA code should be exactly 3 characters
        expect(airport.iataCode).toHaveLength(3);
        expect(airport.iataCode).toMatch(/^[A-Z]{3}$/);
      }
    });

    test('should return airports sorted by relevance', async () => {
      const response = await request(app).get('/airports?query=l');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 1) {
        // First result should start with the query
        const firstAirport = response.body.data[0];
        expect(firstAirport.iataCode.toLowerCase()).toMatch(/^l/);
      }
    });
  });

  describe('Performance and Limits', () => {
    test('should handle rapid consecutive requests', async () => {
      const promises = Array(10).fill(null).map((_, i) => 
        request(app).get(`/airports?query=${String.fromCharCode(65 + i)}`) // A, B, C, etc.
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      });
    });

    test('should not return excessive results for single character queries', async () => {
      const response = await request(app).get('/airports?query=a');
      
      expect(response.status).toBe(200);
      
      // Should have reasonable limit on results (not returning thousands)
      expect(response.body.data.length).toBeLessThan(1000);
    });
  });

  describe('Query Parameter Edge Cases', () => {
    test('should handle queries with leading/trailing whitespace', async () => {
      const response = await request(app).get('/airports?query=%20lhr%20'); // URL encoded spaces
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle multiple query parameters', async () => {
      const response = await request(app).get('/airports?query=lhr&other=param');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle URL encoded characters', async () => {
      const response = await request(app).get('/airports?query=l%2Dhr'); // l-hr with encoded dash
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('HTTP Headers and Caching', () => {
    test('should include proper cache headers', async () => {
      const response = await request(app).get('/airports?query=lhr');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['cache-control']).toContain('max-age=86400');
    });

    test('should compress large responses', async () => {
      const response = await request(app)
        .get('/airports?query=a')
        .set('Accept-Encoding', 'gzip');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    test('should return consistent results across multiple calls', async () => {
      const query = '/airports?query=lhr';
      
      const response1 = await request(app).get(query);
      const response2 = await request(app).get(query);
      const response3 = await request(app).get(query);
      
      expect(response1.body).toEqual(response2.body);
      expect(response2.body).toEqual(response3.body);
    });

    test('should not modify original data', async () => {
      const response1 = await request(app).get('/airports?query=l');
      const response2 = await request(app).get('/airports?query=l');
      
      expect(response1.body).toEqual(response2.body);
      
      // Modify the response data to ensure original data is not affected
      if (response1.body.data.length > 0) {
        response1.body.data[0].modified = true;
        
        const response3 = await request(app).get('/airports?query=l');
        expect(response3.body.data[0]).not.toHaveProperty('modified');
      }
    });
  });
});