import app from '../src/api.js';

describe('CORS Support', () => {
  afterAll(async () => {
    await app.close();
  });

  it('should include CORS headers in GET responses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'http://example.com',
      },
    });

    expect(response.headers['access-control-allow-origin']).toBe('*');
    // Verify body is still there
    expect(response.json()).toEqual({ success: true });
  });

  it('should handle OPTIONS preflight requests', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/airports',
      headers: {
        origin: 'http://example.com',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'content-type',
      },
    });

    // @fastify/cors might return 204 or 200 depending on config, but it should be successful
    expect(response.statusCode).toBeLessThan(300);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
  });

  it('should preserve response body for data endpoints', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/airports?query=LHR',
      headers: {
        origin: 'http://example.com',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    const body = response.json();
    expect(body.data).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].iataCode).toBe('LHR');
  });
});
