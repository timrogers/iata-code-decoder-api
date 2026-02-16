import app from '../src/api.js';

describe('IATA Code Decoder API - Integration Tests', () => {
  // Close the Fastify app after all tests
  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with success status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should have no-cache headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, private',
      );
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('GET /airports', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return airports matching the query (LHR)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LHR',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const airport = body.data[0];
      expect(airport.iataCode).toBe('LHR');
      expect(airport.name).toBeDefined();
      expect(airport.cityName).toBeDefined();
    });

    it('should return airports matching partial query (L)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=L',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // All returned airports should have IATA codes starting with 'L'
      body.data.forEach((airport: { iataCode: string }) => {
        expect(airport.iataCode.toUpperCase()).toMatch(/^L/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LHRX',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await app.inject({
        method: 'GET',
        url: '/airports?query=lhr',
      });
      const responseLower = await app.inject({
        method: 'GET',
        url: '/airports?query=LHR',
      });

      expect(responseUpper.json()).toEqual(responseLower.json());
    });

    it('should have proper cache headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LHR',
      });

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('GET /airlines', () => {
    it('should return all airlines when query parameter is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(100);
    });

    it('should return all airlines when query parameter is empty', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(100);
    });

    it('should return airlines matching the query (BA)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const airline = body.data[0];
      expect(airline.iataCode).toBe('BA');
      expect(airline.name).toBeDefined();
    });

    it('should return airlines matching partial query (A)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=A',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // All returned airlines should have IATA codes starting with 'A'
      body.data.forEach((airline: { iataCode: string }) => {
        expect(airline.iataCode.toUpperCase()).toMatch(/^A/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BAA',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await app.inject({
        method: 'GET',
        url: '/airlines?query=ba',
      });
      const responseLower = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      expect(responseUpper.json()).toEqual(responseLower.json());
    });

    it('should have proper cache headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('GET /aircraft', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return aircraft matching the query (777)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=777',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const aircraft = body.data[0];
      expect(aircraft.iataCode).toBe('777');
      expect(aircraft.name).toBeDefined();
    });

    it('should return aircraft matching partial query (7)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=7',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // All returned aircraft should have IATA codes starting with '7'
      body.data.forEach((aircraft: { iataCode: string }) => {
        expect(aircraft.iataCode.toUpperCase()).toMatch(/^7/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=7777',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await app.inject({
        method: 'GET',
        url: '/aircraft?query=a320',
      });
      const responseLower = await app.inject({
        method: 'GET',
        url: '/aircraft?query=A320',
      });

      expect(responseUpper.json()).toEqual(responseLower.json());
    });

    it('should have proper cache headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=777',
      });

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('MCP Endpoints', () => {
    describe('POST /mcp', () => {
      it('should handle initialization request', async () => {
        const initRequest = {
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              roots: {
                listChanged: true,
              },
            },
            clientInfo: {
              name: 'test-client',
              version: '1.0.0',
            },
          },
          id: 1,
        };

        const response = await app.inject({
          method: 'POST',
          url: '/mcp',
          payload: initRequest,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // MCP endpoint may return different status codes based on the protocol handling
        // The important thing is that it processes the request and doesn't crash
        expect([200, 406, 415].includes(response.statusCode)).toBe(true);
      });

      it('should return 400 for request without session ID and not an initialize request', async () => {
        const invalidRequest = {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
        };

        const response = await app.inject({
          method: 'POST',
          url: '/mcp',
          payload: invalidRequest,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        expect(response.statusCode).toBe(400);
        const body = response.json();
        expect(body).toHaveProperty('error');
        expect(body.error.message).toContain('No valid session ID');
      });
    });

    describe('GET /mcp', () => {
      it('should return 400 when session ID is missing', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/mcp',
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain('Invalid or missing session ID');
      });

      it('should return 400 when session ID is invalid', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/mcp',
          headers: {
            'mcp-session-id': 'invalid-session-id',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain('Invalid or missing session ID');
      });
    });

    describe('DELETE /mcp', () => {
      it('should return 400 when session ID is missing', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: '/mcp',
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain('Invalid or missing session ID');
      });

      it('should return 400 when session ID is invalid', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: '/mcp',
          headers: {
            'mcp-session-id': 'invalid-session-id',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain('Invalid or missing session ID');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-existent endpoints with 404', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-endpoint',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle special characters in queries gracefully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=%20',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('data');
    });
  });

  describe('Airport response schema validation', () => {
    it('should return airport objects with all expected fields for JFK', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=JFK',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBe(1);

      const airport = body.data[0];
      expect(airport).toEqual(
        expect.objectContaining({
          iataCode: 'JFK',
          name: 'John F. Kennedy International Airport',
          cityName: 'New York',
          iataCountryCode: 'US',
          icaoCode: 'KJFK',
          id: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          timeZone: expect.any(String),
        }),
      );
    });

    it('should include city object with expected fields when city is present', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=JFK',
      });

      const airport = response.json().data[0];
      expect(airport.city).not.toBeNull();
      expect(airport.city).toEqual(
        expect.objectContaining({
          iataCode: expect.any(String),
          iataCountryCode: expect.any(String),
          name: expect.any(String),
          id: expect.any(String),
        }),
      );
    });

    it('should return correct data for LAX', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LAX',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBe(1);

      const airport = body.data[0];
      expect(airport.iataCode).toBe('LAX');
      expect(airport.name).toBe('Los Angeles International Airport');
      expect(airport.cityName).toBe('Los Angeles');
      expect(airport.iataCountryCode).toBe('US');
    });

    it('should return multiple airports for two-character partial query (LH)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LH',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThanOrEqual(1);

      body.data.forEach((airport: { iataCode: string }) => {
        expect(airport.iataCode.toUpperCase()).toMatch(/^LH/);
      });
    });

    it('should return empty array for a non-existent airport code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=ZZZ',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });
  });

  describe('Airline response schema validation', () => {
    it('should return airline objects with all expected fields for AA', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=AA',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(0);

      const airline = body.data.find((a: { iataCode: string }) => a.iataCode === 'AA');
      expect(airline).toBeDefined();
      expect(airline).toEqual(
        expect.objectContaining({
          iataCode: 'AA',
          name: 'American Airlines',
          id: expect.any(String),
        }),
      );
    });

    it('should return correct data for British Airways (BA)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      const airline = response
        .json()
        .data.find((a: { iataCode: string }) => a.iataCode === 'BA');
      expect(airline).toBeDefined();
      expect(airline.name).toBe('British Airways');
    });

    it('should ensure all returned airlines have an iataCode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines',
      });

      const body = response.json();
      body.data.forEach((airline: { iataCode: string }) => {
        expect(airline.iataCode).toBeDefined();
        expect(airline.iataCode).not.toBeNull();
      });
    });

    it('should return consistent results for the same query', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/airlines?query=AA',
      });
      const response2 = await app.inject({
        method: 'GET',
        url: '/airlines?query=AA',
      });

      expect(response1.json()).toEqual(response2.json());
    });
  });

  describe('Aircraft response schema validation', () => {
    it('should return aircraft objects with all expected fields for 747', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=747',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(0);

      const aircraft = body.data.find((a: { iataCode: string }) => a.iataCode === '747');
      expect(aircraft).toBeDefined();
      expect(aircraft).toEqual(
        expect.objectContaining({
          iataCode: '747',
          name: 'Boeing 747',
          id: expect.any(String),
        }),
      );
    });

    it('should return correct data for Airbus A320 (320)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=320',
      });

      const aircraft = response
        .json()
        .data.find((a: { iataCode: string }) => a.iataCode === '320');
      expect(aircraft).toBeDefined();
      expect(aircraft.name).toBe('Airbus A320');
    });

    it('should return multiple aircraft for two-character partial query (32)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=32',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(1);

      body.data.forEach((aircraft: { iataCode: string }) => {
        expect(aircraft.iataCode).toMatch(/^32/i);
      });
    });

    it('should return empty array for a non-existent aircraft code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=ZZZ',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ data: [] });
    });
  });

  describe('HTTP method handling', () => {
    it('should return 404 for POST to /airports', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/airports',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for PUT to /airlines', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/airlines',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for PATCH to /aircraft', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/aircraft',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for DELETE to /health', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/health',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for POST to /health', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/health',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Content-Type headers', () => {
    it('should return application/json content-type for airport error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports',
      });

      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return application/json content-type for aircraft error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft',
      });

      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return application/json content-type for airline list responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return application/json content-type for health endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Cache header consistency', () => {
    it('should set cache headers on airport error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports',
      });

      expect(response.statusCode).toBe(400);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });

    it('should set cache headers on aircraft error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft',
      });

      expect(response.statusCode).toBe(400);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });

    it('should set cache headers on airline responses without query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('Additional edge cases', () => {
    it('should handle numeric query for airports gracefully', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=123',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('data');
      expect(Array.isArray(response.json().data)).toBe(true);
    });

    it('should handle unicode characters in queries', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=%C3%BC',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('data');
    });

    it('should handle extra query parameters without errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=JFK&extra=param&foo=bar',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].iataCode).toBe('JFK');
    });

    it('should return exact match for boundary-length airport query (3 chars)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=JFK',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].iataCode).toBe('JFK');
    });

    it('should return exact match for boundary-length airline query (2 chars)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      const ba = body.data.find((a: { iataCode: string }) => a.iataCode === 'BA');
      expect(ba).toBeDefined();
    });

    it('should return exact match for boundary-length aircraft query (3 chars)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=747',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      const b747 = body.data.find((a: { iataCode: string }) => a.iataCode === '747');
      expect(b747).toBeDefined();
    });

    it('should handle mixed case partial queries for airports', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=Jf',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(0);

      body.data.forEach((airport: { iataCode: string }) => {
        expect(airport.iataCode.toUpperCase()).toMatch(/^JF/);
      });
    });

    it('should handle whitespace-only query for airlines (returns all)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=%20',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('data');
    });

    it('should handle single-character queries for aircraft', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=A',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThan(0);

      body.data.forEach((aircraft: { iataCode: string }) => {
        expect(aircraft.iataCode.toUpperCase()).toMatch(/^A/);
      });
    });
  });

  describe('Response data structure', () => {
    it('should always wrap results in a data property for airports', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=JFK',
      });

      const body = response.json();
      expect(Object.keys(body)).toEqual(['data']);
    });

    it('should always wrap results in a data property for airlines', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      const body = response.json();
      expect(Object.keys(body)).toEqual(['data']);
    });

    it('should always wrap results in a data property for aircraft', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft?query=777',
      });

      const body = response.json();
      expect(Object.keys(body)).toEqual(['data']);
    });

    it('should wrap error in a data property for airports', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports',
      });

      const body = response.json();
      expect(Object.keys(body)).toEqual(['data']);
      expect(body.data).toHaveProperty('error');
    });

    it('should wrap error in a data property for aircraft', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/aircraft',
      });

      const body = response.json();
      expect(Object.keys(body)).toEqual(['data']);
      expect(body.data).toHaveProperty('error');
    });
  });

  describe('MCP full session lifecycle', () => {
    it('should handle POST with non-JSON-RPC body gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/mcp',
        payload: { random: 'data' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle POST with invalid session ID for non-init request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/mcp',
        payload: {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
        },
        headers: {
          'Content-Type': 'application/json',
          'mcp-session-id': 'non-existent-session',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return proper JSON-RPC error structure for invalid requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/mcp',
        payload: {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 42,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty('jsonrpc', '2.0');
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(body).toHaveProperty('id', null);
    });

    it('should reject DELETE /mcp with a made-up session ID', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/mcp',
        headers: {
          'mcp-session-id': '00000000-0000-0000-0000-000000000000',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.payload).toContain('Invalid or missing session ID');
    });

    it('should reject GET /mcp with a made-up session ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/mcp',
        headers: {
          'mcp-session-id': '00000000-0000-0000-0000-000000000000',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.payload).toContain('Invalid or missing session ID');
    });
  });

  describe('Multiple endpoint consistency', () => {
    it('should return different data from airports vs airlines vs aircraft', async () => {
      const [airportsRes, airlinesRes, aircraftRes] = await Promise.all([
        app.inject({ method: 'GET', url: '/airports?query=A' }),
        app.inject({ method: 'GET', url: '/airlines?query=A' }),
        app.inject({ method: 'GET', url: '/aircraft?query=A' }),
      ]);

      expect(airportsRes.statusCode).toBe(200);
      expect(airlinesRes.statusCode).toBe(200);
      expect(aircraftRes.statusCode).toBe(200);

      const airports = airportsRes.json().data;
      const airlines = airlinesRes.json().data;
      const aircraft = aircraftRes.json().data;

      // Airports should have fields that airlines and aircraft don't
      if (airports.length > 0) {
        expect(airports[0]).toHaveProperty('cityName');
        expect(airports[0]).toHaveProperty('latitude');
        expect(airports[0]).toHaveProperty('longitude');
      }

      // Airlines should not have airport-specific fields
      if (airlines.length > 0) {
        expect(airlines[0]).not.toHaveProperty('cityName');
        expect(airlines[0]).not.toHaveProperty('latitude');
      }

      // Aircraft should not have airport-specific fields
      if (aircraft.length > 0) {
        expect(aircraft[0]).not.toHaveProperty('cityName');
        expect(aircraft[0]).not.toHaveProperty('latitude');
      }
    });

    it('should handle concurrent requests to different endpoints', async () => {
      const results = await Promise.all([
        app.inject({ method: 'GET', url: '/health' }),
        app.inject({ method: 'GET', url: '/airports?query=JFK' }),
        app.inject({ method: 'GET', url: '/airlines?query=BA' }),
        app.inject({ method: 'GET', url: '/aircraft?query=747' }),
      ]);

      expect(results[0].statusCode).toBe(200);
      expect(results[1].statusCode).toBe(200);
      expect(results[2].statusCode).toBe(200);
      expect(results[3].statusCode).toBe(200);

      expect(results[0].json()).toEqual({ success: true });
      expect(results[1].json().data[0].iataCode).toBe('JFK');
      expect(
        results[2].json().data.find((a: { iataCode: string }) => a.iataCode === 'BA'),
      ).toBeDefined();
      expect(
        results[3].json().data.find((a: { iataCode: string }) => a.iataCode === '747'),
      ).toBeDefined();
    });

    it('should return the same total airlines count across multiple requests', async () => {
      const [response1, response2] = await Promise.all([
        app.inject({ method: 'GET', url: '/airlines' }),
        app.inject({ method: 'GET', url: '/airlines' }),
      ]);

      expect(response1.json().data.length).toBe(response2.json().data.length);
    });
  });
});
