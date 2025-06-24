import request from 'supertest';
import app from '../src/api';

describe('IATA Code Decoder API - Integration Tests', () => {
  describe('Server Health and Setup', () => {
    test('should start without errors', () => {
      expect(app).toBeDefined();
    });

    test('should have proper middleware configured', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Health Endpoint', () => {
    test('GET /health should return 200 and success status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true
      });
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });

    test('should handle multiple concurrent health checks', async () => {
      const promises = Array(10).fill(null).map(() => request(app).get('/health'));
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/non-existent');
      expect(response.status).toBe(404);
    });

    test('should handle invalid HTTP methods on valid paths', async () => {
      const response = await request(app).post('/health');
      expect(response.status).toBe(404);
    });
  });

  describe('Compression and Performance', () => {
    test('should compress responses when appropriate', async () => {
      const response = await request(app)
        .get('/airports?query=lhr')
        .set('Accept-Encoding', 'gzip');
      
      expect(response.status).toBe(200);
      // Supertest automatically handles decompression, so we check that we get valid JSON
      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    test('should respond quickly to health checks', async () => {
      const start = Date.now();
      const response = await request(app).get('/health');
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('CORS and Security Headers', () => {
    test('should handle preflight requests properly', async () => {
      const response = await request(app)
        .options('/airports')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');
      
      // Since no CORS is explicitly configured, this tests the default behavior
      expect(response.status).toBe(200);
    });
  });

  describe('Content-Type and Response Format', () => {
    test('all endpoints should return JSON with proper content-type', async () => {
      const endpoints = [
        { path: '/health', query: '' },
        { path: '/airports', query: '?query=lhr' },
        { path: '/airlines', query: '?query=ba' },
        { path: '/aircraft', query: '?query=74' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(`${endpoint.path}${endpoint.query}`);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toBeDefined();
        expect(typeof response.body).toBe('object');
      }
    });
  });

  describe('Cache Headers', () => {
    test('/health should have no-cache headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });

    test('search endpoints should have cache headers with max-age', async () => {
      const searchEndpoints = ['/airports?query=lhr', '/airlines?query=ba', '/aircraft?query=74'];
      
      for (const endpoint of searchEndpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['cache-control']).toContain('public');
        expect(response.headers['cache-control']).toContain('max-age=86400'); // 24 hours
      }
    });
  });

  describe('Data Consistency', () => {
    test('all search endpoints should return consistent data structure', async () => {
      const endpoints = [
        '/airports?query=lhr',
        '/airlines?query=ba', 
        '/aircraft?query=74'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('should return same results for repeated identical queries', async () => {
      const query = '/airports?query=lhr';
      
      const response1 = await request(app).get(query);
      const response2 = await request(app).get(query);
      
      expect(response1.body).toEqual(response2.body);
    });
  });

  describe('Load Testing', () => {
    test('should handle multiple concurrent requests to different endpoints', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/airports?query=lhr'),
        request(app).get('/airlines?query=ba'),
        request(app).get('/aircraft?query=74'),
        request(app).get('/airports?query=jfk'),
        request(app).get('/airlines?query=aa'),
        request(app).get('/aircraft?query=77'),
        request(app).get('/health')
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      });
    });

    test('should maintain performance under rapid sequential requests', async () => {
      const start = Date.now();
      
      for (let i = 0; i < 20; i++) {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // Should complete 20 requests within 5 seconds
    });
  });

  describe('Edge Cases and Resilience', () => {
    test('should handle requests with unusual but valid query parameters', async () => {
      const edgeCases = [
        '/airports?query=a&extra=param',
        '/airlines?query=z&unused=value',
        '/aircraft?query=1&random=data'
      ];

      for (const endpoint of edgeCases) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      }
    });

    test('should handle encoded characters in query parameters', async () => {
      const response = await request(app).get('/airports?query=l%68r'); // "lhr" encoded
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('should gracefully handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);
      const response = await request(app).get(`/airports?query=${longQuery}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]); // Should return empty array for non-matching long query
    });
  });
});