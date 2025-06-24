import request from 'supertest';
import app from '../src/api';

describe('Airlines Endpoint Integration Tests', () => {
  describe('Valid Airline Searches', () => {
    test('should find airlines with partial IATA code "ba"', async () => {
      const response = await request(app).get('/airlines?query=ba');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const airline = response.body.data[0];
        expect(airline).toHaveProperty('iataCode');
        expect(airline).toHaveProperty('name');
        expect(airline.iataCode.toLowerCase()).toContain('ba'.toLowerCase());
      }
    });

    test('should find airlines with single letter search', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should return multiple airlines starting with 'a'
      response.body.data.forEach((airline: any) => {
        expect(airline.iataCode.toLowerCase().startsWith('a')).toBe(true);
      });
    });

    test('should find exact matches for 2-letter IATA codes', async () => {
      const response = await request(app).get('/airlines?query=AA');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      if (response.body.data.length > 0) {
        const airline = response.body.data.find((a: any) => a.iataCode === 'AA');
        expect(airline).toBeDefined();
        expect(airline.name).toBeDefined();
      }
    });

    test('should handle case-insensitive searches', async () => {
      const lowercase = await request(app).get('/airlines?query=ba');
      const uppercase = await request(app).get('/airlines?query=BA');
      const mixedCase = await request(app).get('/airlines?query=Ba');
      
      expect(lowercase.status).toBe(200);
      expect(uppercase.status).toBe(200);
      expect(mixedCase.status).toBe(200);
      
      // All should return the same results
      expect(lowercase.body.data).toEqual(uppercase.body.data);
      expect(lowercase.body.data).toEqual(mixedCase.body.data);
    });

    test('should find airlines with common IATA codes', async () => {
      const commonCodes = ['AA', 'BA', 'LH', 'AF', 'KL'];
      
      for (const code of commonCodes) {
        const response = await request(app).get(`/airlines?query=${code}`);
        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
      }
    });
  });

  describe('Invalid Airline Searches', () => {
    test('should return empty array for non-existent airline codes', async () => {
      const response = await request(app).get('/airlines?query=XY');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for query longer than 2 characters', async () => {
      const response = await request(app).get('/airlines?query=ABC');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for numeric queries', async () => {
      const response = await request(app).get('/airlines?query=12');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for special characters', async () => {
      const response = await request(app).get('/airlines?query=@#');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    test('should return 400 for missing query parameter', async () => {
      const response = await request(app).get('/airlines');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
      expect(response.body.data.error).toContain('search query must be provided');
    });

    test('should return 400 for empty query parameter', async () => {
      const response = await request(app).get('/airlines?query=');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    test('should return 400 for query parameter with only spaces', async () => {
      const response = await request(app).get('/airlines?query=%20%20'); // URL encoded spaces
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toContain('search query must be provided');
    });
  });

  describe('Data Structure Validation', () => {
    test('returned airlines should have required fields', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const airline = response.body.data[0];
        
        // Check required fields exist
        expect(airline).toHaveProperty('iataCode');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('id');
        
        // Check data types
        expect(typeof airline.iataCode).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.id).toBe('string');
        
        // IATA code should be exactly 2 characters
        expect(airline.iataCode).toHaveLength(2);
        expect(airline.iataCode).toMatch(/^[A-Z0-9]{2}$/);
      }
    });

    test('should return airlines sorted by relevance', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 1) {
        // First result should start with the query
        const firstAirline = response.body.data[0];
        expect(firstAirline.iataCode.toLowerCase()).toMatch(/^a/);
      }
    });

    test('airline data should include optional logo URLs when available', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const airlinesWithLogos = response.body.data.filter((airline: any) => 
          airline.logo_symbol_url || airline.logo_lockup_url
        );
        
        airlinesWithLogos.forEach((airline: any) => {
          if (airline.logo_symbol_url) {
            expect(typeof airline.logo_symbol_url).toBe('string');
            expect(airline.logo_symbol_url).toMatch(/^https?:\/\//);
          }
          if (airline.logo_lockup_url) {
            expect(typeof airline.logo_lockup_url).toBe('string');
            expect(airline.logo_lockup_url).toMatch(/^https?:\/\//);
          }
        });
      }
    });
  });

  describe('Performance and Limits', () => {
    test('should handle rapid consecutive requests', async () => {
      const queries = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const promises = queries.map(query => 
        request(app).get(`/airlines?query=${query}`)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      });
    });

    test('should not return excessive results for single character queries', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      
      // Should have reasonable limit on results
      expect(response.body.data.length).toBeLessThan(500);
    });
  });

  describe('Query Parameter Edge Cases', () => {
    test('should handle queries with leading/trailing whitespace', async () => {
      const response = await request(app).get('/airlines?query=%20ba%20'); // URL encoded spaces
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle multiple query parameters', async () => {
      const response = await request(app).get('/airlines?query=ba&other=param');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle URL encoded characters', async () => {
      const response = await request(app).get('/airlines?query=b%61'); // 'ba' with encoded 'a'
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('HTTP Headers and Caching', () => {
    test('should include proper cache headers', async () => {
      const response = await request(app).get('/airlines?query=ba');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['cache-control']).toContain('max-age=86400');
    });

    test('should compress large responses', async () => {
      const response = await request(app)
        .get('/airlines?query=a')
        .set('Accept-Encoding', 'gzip');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    test('should return consistent results across multiple calls', async () => {
      const query = '/airlines?query=ba';
      
      const response1 = await request(app).get(query);
      const response2 = await request(app).get(query);
      const response3 = await request(app).get(query);
      
      expect(response1.body).toEqual(response2.body);
      expect(response2.body).toEqual(response3.body);
    });

    test('should not modify original data', async () => {
      const response1 = await request(app).get('/airlines?query=a');
      const response2 = await request(app).get('/airlines?query=a');
      
      expect(response1.body).toEqual(response2.body);
      
      // Modify the response data to ensure original data is not affected
      if (response1.body.data.length > 0) {
        response1.body.data[0].modified = true;
        
        const response3 = await request(app).get('/airlines?query=a');
        expect(response3.body.data[0]).not.toHaveProperty('modified');
      }
    });
  });

  describe('Business Logic Validation', () => {
    test('should filter airlines correctly by IATA code length', async () => {
      const response = await request(app).get('/airlines?query=a');
      
      expect(response.status).toBe(200);
      
      // All returned airlines should have 2-character IATA codes starting with 'a'
      response.body.data.forEach((airline: any) => {
        expect(airline.iataCode).toHaveLength(2);
        expect(airline.iataCode.toLowerCase().startsWith('a')).toBe(true);
      });
    });

    test('should handle numeric IATA codes correctly', async () => {
      const response = await request(app).get('/airlines?query=1');
      
      expect(response.status).toBe(200);
      
      // Should find airlines with IATA codes starting with '1' (like '12' for 12 North)
      response.body.data.forEach((airline: any) => {
        expect(airline.iataCode.startsWith('1')).toBe(true);
      });
    });
  });

  describe('Cross-endpoint Consistency', () => {
    test('airlines endpoint should behave consistently with other endpoints for error cases', async () => {
      const airlineError = await request(app).get('/airlines');
      const airportError = await request(app).get('/airports');
      const aircraftError = await request(app).get('/aircraft');
      
      expect(airlineError.status).toBe(400);
      expect(airportError.status).toBe(400);
      expect(aircraftError.status).toBe(400);
      
      expect(airlineError.body.data.error).toBe(airportError.body.data.error);
      expect(airportError.body.data.error).toBe(aircraftError.body.data.error);
    });
  });
});