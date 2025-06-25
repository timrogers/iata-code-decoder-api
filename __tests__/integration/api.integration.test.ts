import request from 'supertest';
import app from '../../src/api.js';

describe('IATA Code Decoder API - Integration Tests', () => {
  
  describe('Health Check Endpoint', () => {
    it('should return 200 and success status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });

    it('should have proper security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('Airports Endpoint', () => {
    describe('Valid Requests', () => {
      it('should return airports matching partial IATA code', async () => {
        const response = await request(app)
          .get('/airports?query=LH')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // Check that all returned airports have IATA codes starting with 'LH'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^lh/);
        });
      });

      it('should return specific airport for exact IATA code', async () => {
        const response = await request(app)
          .get('/airports?query=LHR')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Should find Heathrow
        const heathrow = response.body.data.find((airport: any) => 
          airport.iataCode === 'LHR'
        );
        expect(heathrow).toBeTruthy();
        expect(heathrow.name).toContain('Heathrow');
      });

      it('should return airports for single character query', async () => {
        const response = await request(app)
          .get('/airports?query=L')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // All airports should start with 'L'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^l/);
        });
      });

      it('should return airports for two character query', async () => {
        const response = await request(app)
          .get('/airports?query=NY')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        // All airports should start with 'NY'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^ny/);
        });
      });

      it('should be case insensitive', async () => {
        const upperCaseResponse = await request(app)
          .get('/airports?query=JFK')
          .expect(200);

        const lowerCaseResponse = await request(app)
          .get('/airports?query=jfk')
          .expect(200);

        expect(upperCaseResponse.body.data).toEqual(lowerCaseResponse.body.data);
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/airports?query=ZZZ')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });

      it('should have proper cache headers for successful requests', async () => {
        const response = await request(app)
          .get('/airports?query=LAX')
          .expect(200);

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');
      });
    });

    describe('Invalid Requests', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/airports')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/airports?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return empty array for query longer than 3 characters', async () => {
        const response = await request(app)
          .get('/airports?query=ABCD')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });
    });

    describe('Response Structure', () => {
      it('should return airports with correct structure', async () => {
        const response = await request(app)
          .get('/airports?query=LAX')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        const airport = response.body.data[0];
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('id');
        expect(typeof airport.iataCode).toBe('string');
        expect(typeof airport.name).toBe('string');
        expect(typeof airport.id).toBe('string');
      });
    });
  });

  describe('Airlines Endpoint', () => {
    describe('Valid Requests', () => {
      it('should return airlines matching partial IATA code', async () => {
        const response = await request(app)
          .get('/airlines?query=A')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // Check that all returned airlines have IATA codes starting with 'A'
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase()).toMatch(/^a/);
        });
      });

      it('should return specific airline for exact IATA code', async () => {
        const response = await request(app)
          .get('/airlines?query=AA')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Should find American Airlines
        const americanAirlines = response.body.data.find((airline: any) => 
          airline.iataCode === 'AA'
        );
        expect(americanAirlines).toBeTruthy();
        expect(americanAirlines.name).toContain('American Airlines');
      });

      it('should return airlines for single character query', async () => {
        const response = await request(app)
          .get('/airlines?query=B')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // All airlines should start with 'B'
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase()).toMatch(/^b/);
        });
      });

      it('should be case insensitive', async () => {
        const upperCaseResponse = await request(app)
          .get('/airlines?query=BA')
          .expect(200);

        const lowerCaseResponse = await request(app)
          .get('/airlines?query=ba')
          .expect(200);

        expect(upperCaseResponse.body.data).toEqual(lowerCaseResponse.body.data);
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/airlines?query=XX')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });

      it('should have proper cache headers for successful requests', async () => {
        const response = await request(app)
          .get('/airlines?query=UA')
          .expect(200);

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');
      });
    });

    describe('Invalid Requests', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/airlines')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/airlines?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return empty array for query longer than 2 characters', async () => {
        const response = await request(app)
          .get('/airlines?query=ABC')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });
    });

    describe('Response Structure', () => {
      it('should return airlines with correct structure', async () => {
        const response = await request(app)
          .get('/airlines?query=AA')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        const airline = response.body.data[0];
        expect(airline).toHaveProperty('iataCode');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('id');
        expect(typeof airline.iataCode).toBe('string');
        expect(typeof airline.name).toBe('string');
        expect(typeof airline.id).toBe('string');
      });
    });
  });

  describe('Aircraft Endpoint', () => {
    describe('Valid Requests', () => {
      it('should return aircraft matching partial IATA code', async () => {
        const response = await request(app)
          .get('/aircraft?query=73')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // Check that all returned aircraft have IATA codes starting with '73'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase()).toMatch(/^73/);
        });
      });

      it('should return specific aircraft for exact IATA code', async () => {
        const response = await request(app)
          .get('/aircraft?query=737')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Should find Boeing 737
        const boeing737 = response.body.data.find((aircraft: any) => 
          aircraft.iataCode === '737'
        );
        expect(boeing737).toBeTruthy();
        expect(boeing737.name).toContain('Boeing 737');
      });

      it('should return aircraft for single character query', async () => {
        const response = await request(app)
          .get('/aircraft?query=7')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);

        // All aircraft should start with '7'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase()).toMatch(/^7/);
        });
      });

      it('should be case insensitive', async () => {
        const upperCaseResponse = await request(app)
          .get('/aircraft?query=B73')
          .expect(200);

        const lowerCaseResponse = await request(app)
          .get('/aircraft?query=b73')
          .expect(200);

        expect(upperCaseResponse.body.data).toEqual(lowerCaseResponse.body.data);
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/aircraft?query=ZZZ')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });

      it('should have proper cache headers for successful requests', async () => {
        const response = await request(app)
          .get('/aircraft?query=747')
          .expect(200);

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');
      });
    });

    describe('Invalid Requests', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/aircraft')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/aircraft?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter'
          }
        });
      });

      it('should return empty array for query longer than 3 characters', async () => {
        const response = await request(app)
          .get('/aircraft?query=ABCD')
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      });
    });

    describe('Response Structure', () => {
      it('should return aircraft with correct structure', async () => {
        const response = await request(app)
          .get('/aircraft?query=737')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        const aircraft = response.body.data[0];
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('id');
        expect(typeof aircraft.iataCode).toBe('string');
        expect(typeof aircraft.name).toBe('string');
        expect(typeof aircraft.id).toBe('string');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle multiple query parameters correctly', async () => {
      const response = await request(app)
        .get('/airports?query=LAX&extra=parameter')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle URL encoded query parameters', async () => {
      const response = await request(app)
        .get('/airports?query=LA%20X')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Performance and Load', () => {
    it('should handle concurrent requests efficiently', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        request(app)
          .get(`/airports?query=L${i % 10}`)
          .expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    it('should respond quickly to requests', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/airports?query=LAX')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Data Integrity', () => {
    it('should return consistent results for same query', async () => {
      const firstResponse = await request(app)
        .get('/airports?query=JFK')
        .expect(200);

      const secondResponse = await request(app)
        .get('/airports?query=JFK')
        .expect(200);

      expect(firstResponse.body).toEqual(secondResponse.body);
    });

    it('should maintain proper data types in responses', async () => {
      const response = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach((item: any) => {
        expect(typeof item.id).toBe('string');
        expect(typeof item.iataCode).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.iataCode.length).toBeGreaterThan(0);
        expect(item.name.length).toBeGreaterThan(0);
      });
    });
  });
});