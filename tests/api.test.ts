import request from 'supertest';

// Mock the data modules to avoid import attribute issues
jest.mock('../src/airports', () => ({
  AIRPORTS: [
    {
      iataCode: 'LHR',
      name: 'Heathrow Airport',
      cityName: 'London',
      iataCityCode: 'LON',
      iataCountryCode: 'GB',
      icaoCode: 'EGLL',
      latitude: 51.470311,
      longitude: -0.458118,
      city: {
        iataCountryCode: 'GB',
        iataCode: 'LON',
        name: 'London',
        id: 'cit_lon_gb',
      },
      timeZone: 'Europe/London',
      id: 'arp_lhr_gb',
    },
  ],
}));

jest.mock('../src/airlines', () => ({
  AIRLINES: [
    {
      iataCode: 'BA',
      name: 'British Airways',
      id: 'arl_00009VME7DBKeMags5CliQ',
    },
  ],
}));

jest.mock('../src/aircraft', () => ({
  AIRCRAFT: [
    {
      iataCode: '777',
      name: 'Boeing 777',
      id: 'arc_00009VMF8AhXSSRnQDI6HF',
    },
  ],
}));

import app from '../src/api';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return success status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, private',
      );
    });
  });

  describe('GET /airports', () => {
    it('should return airport data for valid IATA code', async () => {
      const response = await request(app).get('/airports?query=LHR').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('iataCode');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0].iataCode).toBe('LHR');
    });

    it('should return empty array for non-existent IATA code', async () => {
      const response = await request(app).get('/airports?query=XYZ').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return error when query parameter is missing', async () => {
      const response = await request(app).get('/airports').expect(400);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
      expect(response.body.data.error).toBe(
        'A search query must be provided via the `query` querystring parameter',
      );
    });

    it('should return error when query parameter is empty', async () => {
      const response = await request(app).get('/airports?query=').expect(400);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle partial IATA codes', async () => {
      const response = await request(app).get('/airports?query=LH').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return airports starting with 'LH'
      response.body.data.forEach((airport: { iataCode: string }) => {
        expect(airport.iataCode.toLowerCase()).toMatch(/^lh/);
      });
    });

    it('should return empty array for IATA codes longer than 3 characters', async () => {
      const response = await request(app).get('/airports?query=LHRT').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should have correct cache headers', async () => {
      const response = await request(app).get('/airports?query=LHR').expect(200);

      expect(response.headers['cache-control']).toBe('public, max-age=86400');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /airlines', () => {
    it('should return airline data for valid IATA code', async () => {
      const response = await request(app).get('/airlines?query=BA').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('iataCode');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0].iataCode).toBe('BA');
    });

    it('should return empty array for non-existent IATA code', async () => {
      const response = await request(app).get('/airlines?query=XY').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return error when query parameter is missing', async () => {
      const response = await request(app).get('/airlines').expect(400);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle partial IATA codes', async () => {
      const response = await request(app).get('/airlines?query=B').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return airlines starting with 'B'
      response.body.data.forEach((airline: { iataCode: string }) => {
        expect(airline.iataCode.toLowerCase()).toMatch(/^b/);
      });
    });

    it('should return empty array for IATA codes longer than 2 characters', async () => {
      const response = await request(app).get('/airlines?query=BAW').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /aircraft', () => {
    it('should return aircraft data for valid IATA code', async () => {
      const response = await request(app).get('/aircraft?query=777').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('iataCode');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0].iataCode).toBe('777');
    });

    it('should return empty array for non-existent IATA code', async () => {
      const response = await request(app).get('/aircraft?query=XYZ').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return error when query parameter is missing', async () => {
      const response = await request(app).get('/aircraft').expect(400);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('error');
    });

    it('should handle partial IATA codes', async () => {
      const response = await request(app).get('/aircraft?query=77').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return aircraft starting with '77'
      response.body.data.forEach((aircraft: { iataCode: string }) => {
        expect(aircraft.iataCode.toLowerCase()).toMatch(/^77/);
      });
    });

    it('should return empty array for IATA codes longer than 3 characters', async () => {
      const response = await request(app).get('/aircraft?query=7777').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });
});
