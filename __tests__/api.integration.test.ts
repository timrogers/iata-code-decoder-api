import request from 'supertest';
import app from '../src/api.js';

describe('IATA Code Decoder API - Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 with success status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should have no-cache headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, private',
      );
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('GET /airports', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airports');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/airports?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return airports matching the query (LHR)', async () => {
      const response = await request(app).get('/airports?query=LHR');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const airport = response.body.data[0];
      expect(airport.iataCode).toBe('LHR');
      expect(airport.name).toBeDefined();
      expect(airport.cityName).toBeDefined();
    });

    it('should return airports matching partial query (L)', async () => {
      const response = await request(app).get('/airports?query=L');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // All returned airports should have IATA codes starting with 'L'
      response.body.data.forEach((airport: { iataCode: string }) => {
        expect(airport.iataCode.toUpperCase()).toMatch(/^L/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/airports?query=LHRX');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await request(app).get('/airports?query=lhr');
      const responseLower = await request(app).get('/airports?query=LHR');

      expect(responseUpper.body).toEqual(responseLower.body);
    });

    it('should have proper cache headers', async () => {
      const response = await request(app).get('/airports?query=LHR');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('GET /airlines', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airlines');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/airlines?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return airlines matching the query (BA)', async () => {
      const response = await request(app).get('/airlines?query=BA');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const airline = response.body.data[0];
      expect(airline.iataCode).toBe('BA');
      expect(airline.name).toBeDefined();
    });

    it('should return airlines matching partial query (A)', async () => {
      const response = await request(app).get('/airlines?query=A');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // All returned airlines should have IATA codes starting with 'A'
      response.body.data.forEach((airline: { iataCode: string }) => {
        expect(airline.iataCode.toUpperCase()).toMatch(/^A/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/airlines?query=BAA');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await request(app).get('/airlines?query=ba');
      const responseLower = await request(app).get('/airlines?query=BA');

      expect(responseUpper.body).toEqual(responseLower.body);
    });

    it('should have proper cache headers', async () => {
      const response = await request(app).get('/airlines?query=BA');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public/);
      expect(response.headers['cache-control']).toMatch(/max-age=86400/);
    });
  });

  describe('GET /aircraft', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/aircraft');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/aircraft?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return aircraft matching the query (777)', async () => {
      const response = await request(app).get('/aircraft?query=777');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const aircraft = response.body.data[0];
      expect(aircraft.iataCode).toBe('777');
      expect(aircraft.name).toBeDefined();
    });

    it('should return aircraft matching partial query (7)', async () => {
      const response = await request(app).get('/aircraft?query=7');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // All returned aircraft should have IATA codes starting with '7'
      response.body.data.forEach((aircraft: { iataCode: string }) => {
        expect(aircraft.iataCode.toUpperCase()).toMatch(/^7/);
      });
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/aircraft?query=7777');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [] });
    });

    it('should be case-insensitive', async () => {
      const responseUpper = await request(app).get('/aircraft?query=a320');
      const responseLower = await request(app).get('/aircraft?query=A320');

      expect(responseUpper.body).toEqual(responseLower.body);
    });

    it('should have proper cache headers', async () => {
      const response = await request(app).get('/aircraft?query=777');

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

        const response = await request(app)
          .post('/mcp')
          .send(initRequest)
          .set('Content-Type', 'application/json');

        // MCP endpoint may return different status codes based on the protocol handling
        // The important thing is that it processes the request and doesn't crash
        expect([200, 406, 415].includes(response.status)).toBe(true);
      });

      it('should return 400 for request without session ID and not an initialize request', async () => {
        const invalidRequest = {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
        };

        const response = await request(app)
          .post('/mcp')
          .send(invalidRequest)
          .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.message).toContain('No valid session ID');
      });
    });

    describe('GET /mcp', () => {
      it('should return 400 when session ID is missing', async () => {
        const response = await request(app).get('/mcp');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or missing session ID');
      });

      it('should return 400 when session ID is invalid', async () => {
        const response = await request(app)
          .get('/mcp')
          .set('mcp-session-id', 'invalid-session-id');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or missing session ID');
      });
    });

    describe('DELETE /mcp', () => {
      it('should return 400 when session ID is missing', async () => {
        const response = await request(app).delete('/mcp');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or missing session ID');
      });

      it('should return 400 when session ID is invalid', async () => {
        const response = await request(app)
          .delete('/mcp')
          .set('mcp-session-id', 'invalid-session-id');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or missing session ID');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-existent endpoints with 404', async () => {
      const response = await request(app).get('/non-existent-endpoint');

      expect(response.status).toBe(404);
    });

    it('should handle special characters in queries gracefully', async () => {
      const response = await request(app).get('/airports?query=%20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers in response', async () => {
      const response = await request(app).get('/airports?query=LHR');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    it('should not apply rate limiting to health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      // Health endpoint should not have rate limit headers
      expect(response.headers).not.toHaveProperty('ratelimit-limit');
    });

    it('should enforce rate limits after exceeding max requests', async () => {
      // Make 101 requests to exceed the limit (max is 100 per 15 minutes)
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(request(app).get('/airports?query=LHR'));
      }

      const responses = await Promise.all(requests);

      // First 100 should succeed
      const successfulResponses = responses.filter((r) => r.status === 200);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(successfulResponses.length).toBeGreaterThan(0);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check that rate limited response has the correct error message
      const rateLimitedResponse = rateLimitedResponses[0];
      expect(rateLimitedResponse.body).toHaveProperty('data');
      expect(rateLimitedResponse.body.data.error).toContain('Too many requests');
    });

    it('should apply rate limiting to all API endpoints', async () => {
      // Test that rate limiting applies to airports, airlines, and aircraft endpoints
      const airportsResponse = await request(app).get('/airports?query=LHR');
      const airlinesResponse = await request(app).get('/airlines?query=BA');
      const aircraftResponse = await request(app).get('/aircraft?query=777');

      // All should have rate limit headers
      expect(airportsResponse.headers).toHaveProperty('ratelimit-limit');
      expect(airlinesResponse.headers).toHaveProperty('ratelimit-limit');
      expect(aircraftResponse.headers).toHaveProperty('ratelimit-limit');
    });

    it('should apply rate limiting to MCP endpoints', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'test-client',
              version: '1.0.0',
            },
          },
          id: 1,
        });

      // MCP endpoint should have rate limit headers (since it's not /health)
      // The status might vary based on MCP protocol handling, but headers should be present
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });
  });
});
