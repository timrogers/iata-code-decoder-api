process.env.RATE_LIMIT_MAX = '2';
process.env.RATE_LIMIT_TIME_WINDOW_MS = '60000';

const { default: app } = await import('../src/api.js');

export {};

describe('Rate Limiting', () => {
  afterAll(async () => {
    await app.close();
  });

  it('should allow requests within the rate limit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/airports?query=LHR',
    });

    expect(response.statusCode).toBe(200);
  });

  it('should return 429 when rate limit is exceeded', async () => {
    // Second request (still within limit of 2)
    await app.inject({ method: 'GET', url: '/airports?query=JFK' });

    // Third request should exceed the limit
    const response = await app.inject({
      method: 'GET',
      url: '/airports?query=LAX',
    });

    expect(response.statusCode).toBe(429);
    const body = response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('error');
    expect(body.data.error).toMatch(/Rate limit exceeded/);
    expect(response.headers['retry-after']).toBeDefined();
  });

  it('should not rate-limit the /health endpoint', async () => {
    // Send many requests to /health – all should succeed
    for (let i = 0; i < 5; i++) {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });
      expect(response.statusCode).toBe(200);
    }
  });
});
