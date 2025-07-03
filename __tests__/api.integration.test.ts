import request from 'supertest';
import { spawn, ChildProcess } from 'child_process';
import { setTimeout } from 'timers/promises';

interface Airport {
  iataCode: string;
  name: string;
  id: string;
  latitude: number;
  longitude: number;
}

interface Airline {
  iataCode: string;
  name: string;
  id: string;
}

interface Aircraft {
  iataCode: string;
  name: string;
  id: string;
}

describe('IATA Code Decoder API - Integration Tests', () => {
  let serverProcess: ChildProcess;
  const baseURL = 'http://localhost:4001'; // Use a different port for testing

  beforeAll(async () => {
    // Start the server in the background
    serverProcess = spawn('node', ['src/index.js'], {
      env: { ...process.env, PORT: '4001' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Wait for the server to start
    await setTimeout(3000);
  });

  afterAll(async () => {
    // Stop the server
    if (serverProcess) {
      serverProcess.kill();
    }
    await setTimeout(1000);
  });

  // Health endpoint tests
  describe('GET /health', () => {
    it('should return 200 with success: true', async () => {
      const response = await request(baseURL).get('/health').expect(200);

      expect(response.body).toEqual({ success: true });
      expect(response.headers).toHaveProperty(
        'cache-control',
        'no-store, no-cache, must-revalidate, private',
      );
      expect(response.headers).toHaveProperty('pragma', 'no-cache');
      expect(response.headers).toHaveProperty('expires', '0');
    });
  });

  // Airports endpoint tests
  describe('GET /airports', () => {
    it('should return airports matching query "AAH"', async () => {
      const response = await request(baseURL).get('/airports?query=AAH').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned airports have IATA codes starting with "AAH" (case insensitive)
      response.body.data.forEach((airport: Airport) => {
        expect(airport.iataCode.toLowerCase()).toMatch(/^aah/);
        expect(airport).toHaveProperty('name');
        expect(airport).toHaveProperty('id');
        expect(airport).toHaveProperty('latitude');
        expect(airport).toHaveProperty('longitude');
      });

      // Check cache headers
      expect(response.headers).toHaveProperty('cache-control', 'public, max-age=86400');
    });

    it('should return airports matching partial query "AA"', async () => {
      const response = await request(baseURL).get('/airports?query=AA').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned airports have IATA codes starting with "AA" (case insensitive)
      response.body.data.forEach((airport: Airport) => {
        expect(airport.iataCode.toLowerCase()).toMatch(/^aa/);
      });
    });

    it('should handle case insensitive queries', async () => {
      const uppercaseResponse = await request(baseURL)
        .get('/airports?query=AAH')
        .expect(200);

      const lowercaseResponse = await request(baseURL)
        .get('/airports?query=aah')
        .expect(200);

      expect(uppercaseResponse.body.data).toEqual(lowercaseResponse.body.data);
    });

    it('should return empty array for query longer than 3 characters', async () => {
      const response = await request(baseURL).get('/airports?query=AAHHH').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return empty array for non-existent code', async () => {
      const response = await request(baseURL).get('/airports?query=ZZZ').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(baseURL).get('/airports').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(baseURL).get('/airports?query=').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });
  });

  // Airlines endpoint tests
  describe('GET /airlines', () => {
    it('should return airlines matching query "Q5"', async () => {
      const response = await request(baseURL).get('/airlines?query=Q5').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned airlines have IATA codes starting with "Q5" (case insensitive)
      response.body.data.forEach((airline: Airline) => {
        expect(airline.iataCode.toLowerCase()).toMatch(/^q5/);
        expect(airline).toHaveProperty('name');
        expect(airline).toHaveProperty('id');
      });

      // Check cache headers
      expect(response.headers).toHaveProperty('cache-control', 'public, max-age=86400');
    });

    it('should return airlines matching partial query "Q"', async () => {
      const response = await request(baseURL).get('/airlines?query=Q').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned airlines have IATA codes starting with "Q" (case insensitive)
      response.body.data.forEach((airline: Airline) => {
        expect(airline.iataCode.toLowerCase()).toMatch(/^q/);
      });
    });

    it('should handle case insensitive queries', async () => {
      const uppercaseResponse = await request(baseURL)
        .get('/airlines?query=Q5')
        .expect(200);

      const lowercaseResponse = await request(baseURL)
        .get('/airlines?query=q5')
        .expect(200);

      expect(uppercaseResponse.body.data).toEqual(lowercaseResponse.body.data);
    });

    it('should return empty array for query longer than 2 characters', async () => {
      const response = await request(baseURL).get('/airlines?query=Q5X').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return empty array for non-existent code', async () => {
      const response = await request(baseURL).get('/airlines?query=!!').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(baseURL).get('/airlines').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(baseURL).get('/airlines?query=').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });
  });

  // Aircraft endpoint tests
  describe('GET /aircraft', () => {
    it('should return aircraft matching query "AT5"', async () => {
      const response = await request(baseURL).get('/aircraft?query=AT5').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned aircraft have IATA codes starting with "AT5" (case insensitive)
      response.body.data.forEach((aircraft: Aircraft) => {
        expect(aircraft.iataCode.toLowerCase()).toMatch(/^at5/);
        expect(aircraft).toHaveProperty('name');
        expect(aircraft).toHaveProperty('id');
      });

      // Check cache headers
      expect(response.headers).toHaveProperty('cache-control', 'public, max-age=86400');
    });

    it('should return aircraft matching partial query "AT"', async () => {
      const response = await request(baseURL).get('/aircraft?query=AT').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all returned aircraft have IATA codes starting with "AT" (case insensitive)
      response.body.data.forEach((aircraft: Aircraft) => {
        expect(aircraft.iataCode.toLowerCase()).toMatch(/^at/);
      });
    });

    it('should handle case insensitive queries', async () => {
      const uppercaseResponse = await request(baseURL)
        .get('/aircraft?query=AT5')
        .expect(200);

      const lowercaseResponse = await request(baseURL)
        .get('/aircraft?query=at5')
        .expect(200);

      expect(uppercaseResponse.body.data).toEqual(lowercaseResponse.body.data);
    });

    it('should return empty array for query longer than 3 characters', async () => {
      const response = await request(baseURL).get('/aircraft?query=AT5X').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return empty array for non-existent code', async () => {
      const response = await request(baseURL).get('/aircraft?query=ZZZ').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(baseURL).get('/aircraft').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(baseURL).get('/aircraft?query=').expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });
  });
});
