import request from 'supertest';
import app from '../src/api.js';
import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';

describe('IATA Code Decoder API Integration Tests', () => {
  describe('Health Check Endpoint', () => {
    it('should return 200 and success status for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('Airports Endpoint', () => {
    describe('Successful searches', () => {
      it('should return airports for valid 3-letter IATA codes', async () => {
        const response = await request(app)
          .get('/airports?query=LAX')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');

        // Verify that returned airports have LAX IATA code
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase()).toContain('lax');
        });
      });

      it('should return airports for partial IATA codes (case insensitive)', async () => {
        const response = await request(app)
          .get('/airports?query=la')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verify that returned airports start with 'la' (case insensitive)
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase().startsWith('la')).toBe(true);
        });
      });

      it('should return airports for single character search', async () => {
        const response = await request(app)
          .get('/airports?query=L')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verify that returned airports start with 'L' (case insensitive)
        response.body.data.forEach((airport: any) => {
          expect(airport.iataCode.toLowerCase().startsWith('l')).toBe(true);
        });
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/airports?query=ZZZ')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return empty array for codes longer than 3 characters', async () => {
        const response = await request(app)
          .get('/airports?query=LAXX')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should handle special characters in query', async () => {
        const response = await request(app)
          .get('/airports?query=L@X')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });

    describe('Error cases', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/airports')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/airports?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });

      it('should return 400 when query parameter is undefined', async () => {
        const response = await request(app)
          .get('/airports?query')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });
    });

    describe('Data validation', () => {
      it('should return airports with proper structure', async () => {
        const response = await request(app)
          .get('/airports?query=LAX')
          .expect(200);

        if (response.body.data.length > 0) {
          const airport = response.body.data[0];
          expect(airport).toHaveProperty('iataCode');
          expect(airport).toHaveProperty('name');
          expect(airport).toHaveProperty('id');
          expect(typeof airport.iataCode).toBe('string');
          expect(typeof airport.name).toBe('string');
          expect(typeof airport.id).toBe('string');
        }
      });
    });
  });

  describe('Airlines Endpoint', () => {
    describe('Successful searches', () => {
      it('should return airlines for valid 2-letter IATA codes', async () => {
        const response = await request(app)
          .get('/airlines?query=AA')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');

        // Verify that returned airlines start with 'AA'
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase().startsWith('aa')).toBe(true);
        });
      });

      it('should return airlines for partial IATA codes (case insensitive)', async () => {
        const response = await request(app)
          .get('/airlines?query=a')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verify that returned airlines start with 'a' (case insensitive)
        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode.toLowerCase().startsWith('a')).toBe(true);
        });
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/airlines?query=ZZ')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return empty array for codes longer than 2 characters', async () => {
        const response = await request(app)
          .get('/airlines?query=AAA')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });

    describe('Error cases', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/airlines')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/airlines?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });
    });

    describe('Data validation', () => {
      it('should return airlines with proper structure', async () => {
        const response = await request(app)
          .get('/airlines?query=A')
          .expect(200);

        if (response.body.data.length > 0) {
          const airline = response.body.data[0];
          expect(airline).toHaveProperty('iataCode');
          expect(airline).toHaveProperty('name');
          expect(airline).toHaveProperty('id');
          expect(typeof airline.iataCode).toBe('string');
          expect(typeof airline.name).toBe('string');
          expect(typeof airline.id).toBe('string');
        }
      });

      it('should only return airlines with valid IATA codes', async () => {
        const response = await request(app)
          .get('/airlines?query=A')
          .expect(200);

        response.body.data.forEach((airline: any) => {
          expect(airline.iataCode).toBeDefined();
          expect(airline.iataCode).not.toBeNull();
          expect(airline.iataCode).not.toBe('');
        });
      });
    });
  });

  describe('Aircraft Endpoint', () => {
    describe('Successful searches', () => {
      it('should return aircraft for valid 3-letter IATA codes', async () => {
        const response = await request(app)
          .get('/aircraft?query=737')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');

        // Verify that returned aircraft start with '737'
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase().startsWith('737')).toBe(true);
        });
      });

      it('should return aircraft for partial IATA codes (case insensitive)', async () => {
        const response = await request(app)
          .get('/aircraft?query=7')
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verify that returned aircraft start with '7' (case insensitive)
        response.body.data.forEach((aircraft: any) => {
          expect(aircraft.iataCode.toLowerCase().startsWith('7')).toBe(true);
        });
      });

      it('should return empty array for non-existent IATA code', async () => {
        const response = await request(app)
          .get('/aircraft?query=ZZZ')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return empty array for codes longer than 3 characters', async () => {
        const response = await request(app)
          .get('/aircraft?query=7370')
          .expect(200);

        expect(response.body.data).toEqual([]);
      });
    });

    describe('Error cases', () => {
      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/aircraft')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });

      it('should return 400 when query parameter is empty string', async () => {
        const response = await request(app)
          .get('/aircraft?query=')
          .expect(400);

        expect(response.body).toEqual({
          data: {
            error: 'A search query must be provided via the `query` querystring parameter',
          },
        });
      });
    });

    describe('Data validation', () => {
      it('should return aircraft with proper structure', async () => {
        const response = await request(app)
          .get('/aircraft?query=7')
          .expect(200);

        if (response.body.data.length > 0) {
          const aircraft = response.body.data[0];
          expect(aircraft).toHaveProperty('iataCode');
          expect(aircraft).toHaveProperty('name');
          expect(aircraft).toHaveProperty('id');
          expect(typeof aircraft.iataCode).toBe('string');
          expect(typeof aircraft.name).toBe('string');
          expect(typeof aircraft.id).toBe('string');
        }
      });
    });
  });

  describe('Cross-endpoint consistency', () => {
    it('should have consistent error messages across all endpoints', async () => {
      const endpoints = ['/airports', '/airlines', '/aircraft'];
      const expectedError = {
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      };

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(400);

        expect(response.body).toEqual(expectedError);
      }
    });

    it('should have consistent headers across all endpoints', async () => {
      const endpoints = [
        '/airports?query=L',
        '/airlines?query=A',
        '/aircraft?query=7',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.headers['cache-control']).toBe('public, max-age=86400');
      }
    });

    it('should return data in consistent format across all endpoints', async () => {
      const endpoints = [
        '/airports?query=L',
        '/airlines?query=A',
        '/aircraft?query=7',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Load testing and edge cases', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/health').expect(200)
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.body).toEqual({ success: true });
      });
    });

    it('should handle malformed query strings gracefully', async () => {
      const malformedQueries = [
        '/airports?query=%',
        '/airlines?query=<script>',
        '/aircraft?query=\n\r\t',
      ];

      for (const query of malformedQueries) {
        const response = await request(app)
          .get(query)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should handle Unicode characters in queries', async () => {
      const unicodeQueries = [
        '/airports?query=ñ',
        '/airlines?query=ü',
        '/aircraft?query=中',
      ];

      for (const query of unicodeQueries) {
        const response = await request(app)
          .get(query)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Data integrity tests', () => {
    it('should ensure airports data is loaded and accessible', () => {
      expect(AIRPORTS).toBeDefined();
      expect(Array.isArray(AIRPORTS)).toBe(true);
      expect(AIRPORTS.length).toBeGreaterThan(0);
    });

    it('should ensure airlines data is loaded and accessible', () => {
      expect(AIRLINES).toBeDefined();
      expect(Array.isArray(AIRLINES)).toBe(true);
      expect(AIRLINES.length).toBeGreaterThan(0);
    });

    it('should ensure aircraft data is loaded and accessible', () => {
      expect(AIRCRAFT).toBeDefined();
      expect(Array.isArray(AIRCRAFT)).toBe(true);
      expect(AIRCRAFT.length).toBeGreaterThan(0);
    });

    it('should verify all airports have required fields', () => {
      const sampleAirports = AIRPORTS.slice(0, 10); // Test first 10 airports
      sampleAirports.forEach(airport => {
        expect(airport).toHaveProperty('iataCode');
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('id');
        expect(typeof airport.iataCode).toBe('string');
        expect(airport.iataCode.length).toBeLessThanOrEqual(3);
      });
    });

    it('should verify all airlines have required fields and valid IATA codes', () => {
      const sampleAirlines = AIRLINES.slice(0, 10); // Test first 10 airlines
      sampleAirlines.forEach(airline => {
        expect(airline).toHaveProperty('iataCode');
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('id');
        expect(typeof airline.iataCode).toBe('string');
        expect(airline.iataCode).not.toBeNull();
        expect(airline.iataCode).not.toBe('');
        expect(airline.iataCode.length).toBeLessThanOrEqual(2);
      });
    });

    it('should verify all aircraft have required fields', () => {
      const sampleAircraft = AIRCRAFT.slice(0, 10); // Test first 10 aircraft
      sampleAircraft.forEach(aircraft => {
        expect(aircraft).toHaveProperty('iataCode');
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('id');
        expect(typeof aircraft.iataCode).toBe('string');
        expect(aircraft.iataCode.length).toBeLessThanOrEqual(3);
      });
    });
  });
});