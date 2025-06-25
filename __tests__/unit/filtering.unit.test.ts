import request from 'supertest';
import app from '../../src/api.js';

// We need to test the filtering logic which is embedded in the API routes
// Since the filtering function is not exported, we'll test it through the API

describe('Filtering Logic - Unit Tests', () => {

  describe('Partial IATA Code Matching', () => {
    describe('Airports (3-character codes)', () => {
      it('should match single character prefix', async () => {
        const response = await request(app)
          .get('/airports?query=L')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // All results should start with 'L'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^l/);
        });
      });

      it('should match two character prefix', async () => {
        const response = await request(app)
          .get('/airports?query=LA')
          .expect(200);

        // All results should start with 'LA'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^la/);
        });
      });

      it('should match three character exact code', async () => {
        const response = await request(app)
          .get('/airports?query=LAX')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Should find LAX specifically
        const lax = response.body.data.find((airport: any) => 
          airport.iataCode === 'LAX'
        );
        expect(lax).toBeTruthy();
        
        // All results should start with 'LAX'
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toMatch(/^lax/);
        });
      });

      it('should return empty array for queries longer than 3 characters', async () => {
        const response = await request(app)
          .get('/airports?query=LAXX')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });

    describe('Airlines (2-character codes)', () => {
      it('should match single character prefix', async () => {
        const response = await request(app)
          .get('/airlines?query=A')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // All results should start with 'A'
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase()).toMatch(/^a/);
        });
      });

      it('should match two character exact code', async () => {
        const response = await request(app)
          .get('/airlines?query=AA')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Should find AA specifically
        const aa = response.body.data.find((airline: any) => 
          airline.iataCode === 'AA'
        );
        expect(aa).toBeTruthy();
        
        // All results should start with 'AA'
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase()).toMatch(/^aa/);
        });
      });

      it('should return empty array for queries longer than 2 characters', async () => {
        const response = await request(app)
          .get('/airlines?query=AAA')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });

    describe('Aircraft (3-character codes)', () => {
      it('should match single character prefix', async () => {
        const response = await request(app)
          .get('/aircraft?query=7')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // All results should start with '7'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase()).toMatch(/^7/);
        });
      });

      it('should match two character prefix', async () => {
        const response = await request(app)
          .get('/aircraft?query=73')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // All results should start with '73'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase()).toMatch(/^73/);
        });
      });

      it('should match three character exact code', async () => {
        const response = await request(app)
          .get('/aircraft?query=737')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Should find 737 specifically
        const boeing737 = response.body.data.find((aircraft: any) => 
          aircraft.iataCode === '737'
        );
        expect(boeing737).toBeTruthy();
        
        // All results should start with '737'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase()).toMatch(/^737/);
        });
      });

      it('should return empty array for queries longer than 3 characters', async () => {
        const response = await request(app)
          .get('/aircraft?query=7377')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });
  });

  describe('Case Insensitive Matching', () => {
    it('should match regardless of query case for airports', async () => {
      const queries = ['lax', 'LAX', 'Lax', 'lAx', 'laX'];
      const results: any[] = [];

      for (const query of queries) {
        const response = await request(app)
          .get(`/airports?query=${query}`)
          .expect(200);
        results.push(response.body);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    it('should match regardless of query case for airlines', async () => {
      const queries = ['aa', 'AA', 'Aa', 'aA'];
      const results: any[] = [];

      for (const query of queries) {
        const response = await request(app)
          .get(`/airlines?query=${query}`)
          .expect(200);
        results.push(response.body);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    it('should match regardless of query case for aircraft', async () => {
      const queries = ['73h', '73H', '73h'];
      const results: any[] = [];

      for (const query of queries) {
        const response = await request(app)
          .get(`/aircraft?query=${query}`)
          .expect(200);
        results.push(response.body);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });
  });

  describe('Length Validation', () => {
    it('should respect maximum length constraints for each endpoint', async () => {
      // Test airport length constraint (max 3)
      const airportValid = await request(app)
        .get('/airports?query=ABC')
        .expect(200);
      expect(Array.isArray(airportValid.body.data)).toBe(true);

      const airportInvalid = await request(app)
        .get('/airports?query=ABCD')
        .expect(200);
      expect(airportInvalid.body.data).toEqual([]);

      // Test airline length constraint (max 2)
      const airlineValid = await request(app)
        .get('/airlines?query=AB')
        .expect(200);
      expect(Array.isArray(airlineValid.body.data)).toBe(true);

      const airlineInvalid = await request(app)
        .get('/airlines?query=ABC')
        .expect(200);
      expect(airlineInvalid.body.data).toEqual([]);

      // Test aircraft length constraint (max 3)
      const aircraftValid = await request(app)
        .get('/aircraft?query=ABC')
        .expect(200);
      expect(Array.isArray(aircraftValid.body.data)).toBe(true);

      const aircraftInvalid = await request(app)
        .get('/aircraft?query=ABCD')
        .expect(200);
      expect(aircraftInvalid.body.data).toEqual([]);
    });
  });

  describe('Result Ordering and Consistency', () => {
    it('should return results in consistent order', async () => {
      const query = 'A';
      const responses: any[] = [];

      // Make multiple requests with the same query
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get(`/airports?query=${query}`)
          .expect(200);
        responses.push(response.body.data);
      }

      // All responses should be identical and in same order
      const firstResponse = responses[0];
      responses.forEach(response => {
        expect(response).toEqual(firstResponse);
        expect(response.length).toBe(firstResponse.length);
        
        // Check each element is in same position
        response.forEach((item: any, index: number) => {
          expect(item).toEqual(firstResponse[index]);
        });
      });
    });

    it('should maintain result order across different query lengths', async () => {
      // Test that results for 'A' include results for 'AA', etc.
      const singleChar = await request(app)
        .get('/airlines?query=A')
        .expect(200);

      const doubleChar = await request(app)
        .get('/airlines?query=AA')
        .expect(200);

      // Results for 'AA' should be a subset of results for 'A'
      if (doubleChar.body.data.length > 0) {
        doubleChar.body.data.forEach((airline: any) => {
          const foundInSingle = singleChar.body.data.find((a: any) => 
            a.iataCode === airline.iataCode
          );
          expect(foundInSingle).toBeTruthy();
        });
      }
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle numeric characters in codes', async () => {
      const response = await request(app)
        .get('/aircraft?query=7')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All results should start with '7'
      response.body.data.forEach((aircraft: any) => {
        expect(aircraft.iataCode).toMatch(/^7/);
      });
    });

    it('should handle mixed alphanumeric codes', async () => {
      const response = await request(app)
        .get('/aircraft?query=B7')
        .expect(200);

      // All results should start with 'B7' (case insensitive)
      response.body.data.forEach((aircraft: any) => {
        expect(aircraft.iataCode.toLowerCase()).toMatch(/^b7/);
      });
    });

    it('should handle queries with whitespace gracefully', async () => {
      // Query with leading/trailing spaces
      const response = await request(app)
        .get('/airports?query=%20A%20')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Empty Results Handling', () => {
    it('should return empty array for non-matching queries', async () => {
      const response = await request(app)
        .get('/airports?query=ZZZ')
        .expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should return empty array consistently for impossible queries', async () => {
      const impossibleQueries = ['XXX', 'QQQ', 'ZZZ'];
      
      for (const query of impossibleQueries) {
        const response = await request(app)
          .get(`/airports?query=${query}`)
          .expect(200);

        expect(response.body).toEqual({ data: [] });
      }
    });

    it('should handle queries that might exist but dont in dataset', async () => {
      // These might be valid IATA codes but not in our dataset
      const potentialCodes = ['XYZ', 'ABC', 'DEF'];
      
      for (const code of potentialCodes) {
        const response = await request(app)
          .get(`/airports?query=${code}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        // Could be empty or have results - both are valid
      }
    });
  });

  describe('Performance of Filtering', () => {
    it('should filter large result sets efficiently', async () => {
      const startTime = Date.now();
      
      // Query that likely returns many results
      const response = await request(app)
        .get('/airports?query=A')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(500); // Should be fast even with many results
    });

    it('should filter small result sets efficiently', async () => {
      const startTime = Date.now();
      
      // Query that likely returns few results
      const response = await request(app)
        .get('/airports?query=LAX')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100); // Should be very fast for specific queries
    });
  });

  describe('Filtering Accuracy', () => {
    it('should only return items that truly match the prefix', async () => {
      const response = await request(app)
        .get('/airports?query=NY')
        .expect(200);

      // Every result should start with 'NY'
      response.body.data.forEach((airport: any) => {
        expect(airport.iataCode.toLowerCase().startsWith('ny')).toBe(true);
      });
    });

    it('should not return partial matches in the middle of codes', async () => {
      const response = await request(app)
        .get('/airports?query=EW')
        .expect(200);

      // Should only match codes that START with 'EW', not contain 'EW'
      response.body.data.forEach((airport: any) => {
        expect(airport.iataCode.toLowerCase().indexOf('ew')).toBe(0);
      });
    });

    it('should be precise with exact matches', async () => {
      const response = await request(app)
        .get('/airlines?query=AA')
        .expect(200);

      // Should definitely include American Airlines (AA)
      const americanAirlines = response.body.data.find((airline: any) => 
        airline.iataCode === 'AA'
      );
      expect(americanAirlines).toBeTruthy();
      expect(americanAirlines.name).toContain('American Airlines');

      // All results should start with 'AA'
      response.body.data.forEach((airline: any) => {
        expect(airline.iataCode.toLowerCase().startsWith('aa')).toBe(true);
      });
    });
  });
});