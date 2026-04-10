process.env.RATE_LIMIT_MAX = '2';
process.env.RATE_LIMIT_TIME_WINDOW_MS = '60000';

const { default: app } = await import('../src/api.js');

export {};

describe('Rate Limiting', () => {
  afterAll(async () => {
    await app.close();
  });

  it('should return 429 when rate limit is exceeded and include expected error body', async () => {
    // First request – within limit
    const r1 = await app.inject({ method: 'GET', url: '/airports?query=LHR' });
    expect(r1.statusCode).toBe(200);

    // Second request – still within limit of 2
    const r2 = await app.inject({ method: 'GET', url: '/airports?query=JFK' });
    expect(r2.statusCode).toBe(200);

    // Third request – exceeds the limit
    const r3 = await app.inject({ method: 'GET', url: '/airports?query=LAX' });
    expect(r3.statusCode).toBe(429);
    const body = r3.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('error');
    expect(body.data.error).toMatch(/Rate limit exceeded/);
    expect(r3.headers['retry-after']).toBeDefined();
  });

  it('should not rate-limit the /health endpoint', async () => {
    // Send many requests to /health – all should succeed even though
    // the global rate limit has already been exceeded for other routes
    for (let i = 0; i < 5; i++) {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });
      expect(response.statusCode).toBe(200);
    }
  });
});
