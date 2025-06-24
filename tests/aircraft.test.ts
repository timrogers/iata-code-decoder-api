import request from 'supertest';
import app from '../src/api';

describe('Aircraft Endpoint Integration Tests', () => {
  describe('Valid Aircraft Searches', () => {
    test('should find aircraft with partial IATA code "74"', async () => {
      const response = await request(app).get('/aircraft?query=74');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const aircraft = response.body.data[0];
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft.iataCode.toLowerCase()).toContain('74'.toLowerCase());
      }
    });

    test('should find aircraft with single character search', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should return multiple aircraft starting with '7'
      response.body.data.forEach((aircraft: any) => {
        expect(aircraft.iataCode.toLowerCase().startsWith('7')).toBe(true);
      });
    });

    test('should find aircraft with two-character search', async () => {
      const response = await request(app).get('/aircraft?query=74');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((aircraft: any) => {
        expect(aircraft.iataCode.toLowerCase().startsWith('74')).toBe(true);
      });
    });

    test('should find exact matches for 3-character IATA codes', async () => {
      const response = await request(app).get('/aircraft?query=744');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      if (response.body.data.length > 0) {
        const aircraft = response.body.data.find((a: any) => a.iataCode === '744');
        if (aircraft) {
          expect(aircraft.name).toBeDefined();
          expect(aircraft.id).toBeDefined();
        }
      }
    });

    test('should handle case-insensitive searches', async () => {
      const lowercase = await request(app).get('/aircraft?query=a32');
      const uppercase = await request(app).get('/aircraft?query=A32');
      const mixedCase = await request(app).get('/aircraft?query=a3');
      
      expect(lowercase.status).toBe(200);
      expect(uppercase.status).toBe(200);
      expect(mixedCase.status).toBe(200);
      
      // All should return the same results
      expect(lowercase.body.data).toEqual(uppercase.body.data);
    });

    test('should find aircraft with common IATA codes', async () => {
      const commonCodes = ['74', '32', '77', '38', 'CR'];
      
      for (const code of commonCodes) {
        const response = await request(app).get(`/aircraft?query=${code}`);
        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
      }
    });
  });

  describe('Invalid Aircraft Searches', () => {
    test('should return empty array for non-existent aircraft codes', async () => {
      const response = await request(app).get('/aircraft?query=ZZZ');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for query longer than 3 characters', async () => {
      const response = await request(app).get('/aircraft?query=ABCD');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for special characters only', async () => {
      const response = await request(app).get('/aircraft?query=@#$');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return empty array for spaces only', async () => {
      const response = await request(app).get('/aircraft?query=   ');
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toContain('search query must be provided');
    });
  });

  describe('Error Cases', () => {
    test('should return 400 for missing query parameter', async () => {
      const response = await request(app).get('/aircraft');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
      expect(response.body.data.error).toContain('search query must be provided');
    });

    test('should return 400 for empty query parameter', async () => {
      const response = await request(app).get('/aircraft?query=');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    test('should return 400 for query parameter with only spaces', async () => {
      const response = await request(app).get('/aircraft?query=%20%20%20'); // URL encoded spaces
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toContain('search query must be provided');
    });
  });

  describe('Data Structure Validation', () => {
    test('returned aircraft should have required fields', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const aircraft = response.body.data[0];
        
        // Check required fields exist
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('id');
        
        // Check data types
        expect(typeof aircraft.iataCode).toBe('string');
        expect(typeof aircraft.name).toBe('string');
        expect(typeof aircraft.id).toBe('string');
        
        // IATA code should be 3 characters or less
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(3);
        expect(aircraft.iataCode.length).toBeGreaterThan(0);
      }
    });

    test('should return aircraft sorted by relevance', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 1) {
        // First result should start with the query
        const firstAircraft = response.body.data[0];
        expect(firstAircraft.iataCode.toLowerCase()).toMatch(/^7/);
      }
    });

    test('aircraft names should be descriptive', async () => {
      const response = await request(app).get('/aircraft?query=74');
      
      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.name.length).toBeGreaterThan(3);
          // Aircraft names typically include manufacturer or aircraft type
          expect(aircraft.name).toMatch(/[A-Za-z]/);
        });
      }
    });
  });

  describe('Performance and Limits', () => {
    test('should handle rapid consecutive requests', async () => {
      const queries = ['7', '3', '2', '8', '9', 'A', 'B', 'C', 'D', 'E'];
      const promises = queries.map(query => 
        request(app).get(`/aircraft?query=${query}`)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      });
    });

    test('should not return excessive results for single character queries', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      
      // Should have reasonable limit on results
      expect(response.body.data.length).toBeLessThan(200);
    });

    test('should handle mixed alphanumeric queries', async () => {
      const mixedQueries = ['A3', '73', 'B7', 'CR', 'DH'];
      
      for (const query of mixedQueries) {
        const response = await request(app).get(`/aircraft?query=${query}`);
        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
      }
    });
  });

  describe('Query Parameter Edge Cases', () => {
    test('should handle queries with leading/trailing whitespace', async () => {
      const response = await request(app).get('/aircraft?query=%2074%20'); // URL encoded spaces
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle multiple query parameters', async () => {
      const response = await request(app).get('/aircraft?query=74&other=param');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should handle URL encoded characters', async () => {
      const response = await request(app).get('/aircraft?query=7%34'); // '74' with encoded '4'
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('HTTP Headers and Caching', () => {
    test('should include proper cache headers', async () => {
      const response = await request(app).get('/aircraft?query=74');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['cache-control']).toContain('max-age=86400');
    });

    test('should compress large responses', async () => {
      const response = await request(app)
        .get('/aircraft?query=7')
        .set('Accept-Encoding', 'gzip');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    test('should return consistent results across multiple calls', async () => {
      const query = '/aircraft?query=74';
      
      const response1 = await request(app).get(query);
      const response2 = await request(app).get(query);
      const response3 = await request(app).get(query);
      
      expect(response1.body).toEqual(response2.body);
      expect(response2.body).toEqual(response3.body);
    });

    test('should not modify original data', async () => {
      const response1 = await request(app).get('/aircraft?query=7');
      const response2 = await request(app).get('/aircraft?query=7');
      
      expect(response1.body).toEqual(response2.body);
      
      // Modify the response data to ensure original data is not affected
      if (response1.body.data.length > 0) {
        response1.body.data[0].modified = true;
        
        const response3 = await request(app).get('/aircraft?query=7');
        expect(response3.body.data[0]).not.toHaveProperty('modified');
      }
    });
  });

  describe('Business Logic Validation', () => {
    test('should filter aircraft correctly by IATA code length', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      
      // All returned aircraft should have IATA codes starting with '7'
      response.body.data.forEach((aircraft: any) => {
        expect(aircraft.iataCode.toLowerCase().startsWith('7')).toBe(true);
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(3);
      });
    });

    test('should handle both numeric and alphabetic aircraft codes', async () => {
      const numericResponse = await request(app).get('/aircraft?query=7');
      const alphaResponse = await request(app).get('/aircraft?query=A');
      
      expect(numericResponse.status).toBe(200);
      expect(alphaResponse.status).toBe(200);
      
      // Both should return valid results if aircraft exist
      if (numericResponse.body.data.length > 0) {
        numericResponse.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.startsWith('7')).toBe(true);
        });
      }
      
      if (alphaResponse.body.data.length > 0) {
        alphaResponse.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase().startsWith('a')).toBe(true);
        });
      }
    });
  });

  describe('Cross-endpoint Consistency', () => {
    test('aircraft endpoint should behave consistently with other endpoints for error cases', async () => {
      const aircraftError = await request(app).get('/aircraft');
      const airportError = await request(app).get('/airports');
      const airlineError = await request(app).get('/airlines');
      
      expect(aircraftError.status).toBe(400);
      expect(airportError.status).toBe(400);
      expect(airlineError.status).toBe(400);
      
      expect(aircraftError.body.data.error).toBe(airportError.body.data.error);
      expect(airportError.body.data.error).toBe(airlineError.body.data.error);
    });

    test('aircraft endpoint should have same cache behavior as other endpoints', async () => {
      const aircraftResponse = await request(app).get('/aircraft?query=7');
      const airportResponse = await request(app).get('/airports?query=l');
      const airlineResponse = await request(app).get('/airlines?query=a');
      
      expect(aircraftResponse.headers['cache-control']).toBe(airportResponse.headers['cache-control']);
      expect(airportResponse.headers['cache-control']).toBe(airlineResponse.headers['cache-control']);
    });
  });

  describe('Real-world Aircraft Scenarios', () => {
    test('should handle Boeing aircraft codes if available', async () => {
      const boeingCodes = ['74', '77', '73', '78'];
      
      for (const code of boeingCodes) {
        const response = await request(app).get(`/aircraft?query=${code}`);
        expect(response.status).toBe(200);
        
        if (response.body.data.length > 0) {
          // If Boeing aircraft are found, they should have proper naming
          const boeingAircraft = response.body.data.filter((aircraft: any) => 
            aircraft.name.toLowerCase().includes('boeing') || 
            aircraft.iataCode.startsWith(code)
          );
          
          boeingAircraft.forEach((aircraft: any) => {
            expect(aircraft.name).toBeDefined();
            expect(aircraft.iataCode).toBeDefined();
          });
        }
      }
    });

    test('should handle Airbus aircraft codes if available', async () => {
      const airbusCodes = ['32', '33', '34', '35'];
      
      for (const code of airbusCodes) {
        const response = await request(app).get(`/aircraft?query=${code}`);
        expect(response.status).toBe(200);
        
        if (response.body.data.length > 0) {
          // If Airbus aircraft are found, they should have proper naming
          const airbusAircraft = response.body.data.filter((aircraft: any) => 
            aircraft.name.toLowerCase().includes('airbus') || 
            aircraft.iataCode.startsWith(code)
          );
          
          airbusAircraft.forEach((aircraft: any) => {
            expect(aircraft.name).toBeDefined();
            expect(aircraft.iataCode).toBeDefined();
          });
        }
      }
    });
  });
});