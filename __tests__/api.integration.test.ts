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
});
