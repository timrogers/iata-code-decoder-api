import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';

// Mock the data modules
jest.mock('../src/airports.js', () => ({
  AIRPORTS: [
    {
      time_zone: "Europe/London",
      name: "Heathrow Airport",
      longitude: -0.454295,
      latitude: 51.4700223,
      id: "arp_lhr_gb",
      icaoCode: "EGLL",
      iataCode: "LHR",
      iataCountryCode: "GB",
      cityName: "London",
      city: {
        name: "London",
        id: "cit_london_gb",
        iataCode: "LON",
        iataCountryCode: "GB"
      }
    },
    {
      time_zone: "America/New_York",
      name: "LaGuardia Airport",
      longitude: -73.8740185,
      latitude: 40.7769271,
      id: "arp_lga_us",
      icaoCode: "KLGA",
      iataCode: "LGA",
      iataCountryCode: "US",
      cityName: "New York",
      city: null
    },
    {
      time_zone: "America/Los_Angeles",
      name: "Los Angeles International Airport",
      longitude: -118.4081666,
      latitude: 33.9424955,
      id: "arp_lax_us",
      icaoCode: "KLAX",
      iataCode: "LAX",
      iataCountryCode: "US",
      cityName: "Los Angeles",
      city: null
    }
  ]
}));

jest.mock('../src/airlines.js', () => ({
  AIRLINES: [
    {
      id: "aln_00001876ac",
      name: "British Airways",
      iataCode: "BA"
    },
    {
      id: "aln_00001877ac",
      name: "Lufthansa",
      iataCode: "LH"
    },
    {
      id: "aln_00001878ac",
      name: "American Airlines",
      iataCode: "AA"
    }
  ]
}));

jest.mock('../src/aircraft.js', () => ({
  AIRCRAFT: [
    {
      iataCode: "73G",
      id: "act_00009dcf0c",
      name: "Boeing 737-700"
    },
    {
      iataCode: "320",
      id: "act_00009dcf0d",
      name: "Airbus A320"
    },
    {
      iataCode: "738",
      id: "act_00009dcf0e",
      name: "Boeing 737-800"
    }
  ]
}));

describe('API Endpoints', () => {
  let app: Express;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Dynamic import to respect mocks
    const apiModule = await import('../src/api.js');
    app = apiModule.default;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    test('should return health check with correct headers', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('GET /airports', () => {
    test('should return airports matching partial IATA code', async () => {
      const response = await request(app).get('/airports?query=L');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3); // LHR, LGA, LAX
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    test('should return specific airport for exact match', async () => {
      const response = await request(app).get('/airports?query=LHR');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LHR');
      expect(response.body.data[0].name).toBe('Heathrow Airport');
    });

    test('should return empty array for partial code longer than 3 characters', async () => {
      const response = await request(app).get('/airports?query=LHRX');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return case insensitive results', async () => {
      const response = await request(app).get('/airports?query=lhr');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LHR');
    });

    test('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airports');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });

    test('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/airports?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });

    test('should return no results for non-matching query', async () => {
      const response = await request(app).get('/airports?query=XYZ');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /airlines', () => {
    test('should return airlines matching partial IATA code', async () => {
      const response = await request(app).get('/airlines?query=A');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1); // AA
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    test('should return specific airline for exact match', async () => {
      const response = await request(app).get('/airlines?query=BA');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
      expect(response.body.data[0].name).toBe('British Airways');
    });

    test('should return empty array for partial code longer than 2 characters', async () => {
      const response = await request(app).get('/airlines?query=BAX');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return case insensitive results', async () => {
      const response = await request(app).get('/airlines?query=ba');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
    });

    test('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airlines');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });

    test('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/airlines?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });
  });

  describe('GET /aircraft', () => {
    test('should return aircraft matching partial IATA code', async () => {
      const response = await request(app).get('/aircraft?query=73');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2); // 73G, 738
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    test('should return specific aircraft for exact match', async () => {
      const response = await request(app).get('/aircraft?query=320');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('320');
      expect(response.body.data[0].name).toBe('Airbus A320');
    });

    test('should return empty array for partial code longer than 3 characters', async () => {
      const response = await request(app).get('/aircraft?query=320X');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('should return case insensitive results', async () => {
      const response = await request(app).get('/aircraft?query=73g');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('73G');
    });

    test('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/aircraft');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });

    test('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/aircraft?query=');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter'
        }
      });
    });
  });

  describe('filterObjectsByPartialIataCode function behavior', () => {
    test('should handle partial matching correctly for airports', async () => {
      const response = await request(app).get('/airports?query=LA');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1); // Only LAX starts with "LA"
      expect(response.body.data[0].iataCode).toBe('LAX');
    });

    test('should handle single character matching for airlines', async () => {
      const response = await request(app).get('/airlines?query=L');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1); // LH
      expect(response.body.data[0].iataCode).toBe('LH');
    });

    test('should handle exact length matching', async () => {
      const airportsResponse = await request(app).get('/airports?query=LGA');
      expect(airportsResponse.body.data).toHaveLength(1);
      expect(airportsResponse.body.data[0].iataCode).toBe('LGA');

      const airlinesResponse = await request(app).get('/airlines?query=BA');
      expect(airlinesResponse.body.data).toHaveLength(1);
      expect(airlinesResponse.body.data[0].iataCode).toBe('BA');

      const aircraftResponse = await request(app).get('/aircraft?query=320');
      expect(aircraftResponse.body.data).toHaveLength(1);
      expect(aircraftResponse.body.data[0].iataCode).toBe('320');
    });
  });

  describe('Error handling', () => {
    test('should handle non-existent routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});