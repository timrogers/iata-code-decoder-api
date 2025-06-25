import request from 'supertest';
import app from '../api.js';

// Mock the data modules to control test data
jest.mock('../airports.js', () => ({
  AIRPORTS: [
    {
      time_zone: 'America/New_York',
      name: 'John F. Kennedy International Airport',
      longitude: -73.7781,
      latitude: 40.6413,
      id: 'jfk_001',
      icaoCode: 'KJFK',
      iataCode: 'JFK',
      iataCountryCode: 'US',
      cityName: 'New York',
      city: {
        name: 'New York',
        id: 'nyc_001',
        iataCode: 'NYC',
        iataCountryCode: 'US',
      },
    },
    {
      time_zone: 'America/Los_Angeles',
      name: 'Los Angeles International Airport',
      longitude: -118.4085,
      latitude: 33.9425,
      id: 'lax_001',
      icaoCode: 'KLAX',
      iataCode: 'LAX',
      iataCountryCode: 'US',
      cityName: 'Los Angeles',
      city: null,
    },
    {
      time_zone: 'Europe/London',
      name: 'London Heathrow Airport',
      longitude: -0.4614,
      latitude: 51.4700,
      id: 'lhr_001',
      icaoCode: 'EGLL',
      iataCode: 'LHR',
      iataCountryCode: 'GB',
      cityName: 'London',
      city: {
        name: 'London',
        id: 'lon_001',
        iataCode: 'LON',
        iataCountryCode: 'GB',
      },
    },
  ]
}));

jest.mock('../airlines.js', () => ({
  AIRLINES: [
    {
      id: 'american_airlines',
      name: 'American Airlines',
      iataCode: 'AA',
    },
    {
      id: 'delta_airlines', 
      name: 'Delta Air Lines',
      iataCode: 'DL',
    },
    {
      id: 'united_airlines',
      name: 'United Airlines',
      iataCode: 'UA',
    },
    {
      id: 'alaska_airlines',
      name: 'Alaska Airlines',
      iataCode: 'AS',
    },
  ]
}));

jest.mock('../aircraft.js', () => ({
  AIRCRAFT: [
    {
      iataCode: '737',
      id: 'boeing_737',
      name: 'Boeing 737',
    },
    {
      iataCode: '777',
      id: 'boeing_777',
      name: 'Boeing 777',
    },
    {
      iataCode: 'A380',
      id: 'airbus_a380',
      name: 'Airbus A380',
    },
    {
      iataCode: 'A320',
      id: 'airbus_a320',
      name: 'Airbus A320',
    },
  ]
}));

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 with success true', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('GET /airports', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/airports')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app)
        .get('/airports?query=')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching airports for valid query', async () => {
      const response = await request(app)
        .get('/airports?query=J')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('JFK');
      expect(response.body.data[0].name).toBe('John F. Kennedy International Airport');
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    it('should return multiple airports for partial matches', async () => {
      const response = await request(app)
        .get('/airports?query=L')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const iataCodes = response.body.data.map((airport: any) => airport.iataCode);
      expect(iataCodes).toContain('LAX');
      expect(iataCodes).toContain('LHR');
    });

    it('should return empty array for non-matching query', async () => {
      const response = await request(app)
        .get('/airports?query=XYZ')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle case-insensitive searches', async () => {
      const response = await request(app)
        .get('/airports?query=jfk')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('JFK');
    });

    it('should handle exact matches', async () => {
      const response = await request(app)
        .get('/airports?query=LAX')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LAX');
    });

    it('should return empty array for queries longer than 3 characters', async () => {
      const response = await request(app)
        .get('/airports?query=JFKX')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /airlines', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/airlines')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app)
        .get('/airlines?query=')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching airlines for valid query', async () => {
      const response = await request(app)
        .get('/airlines?query=A')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const iataCodes = response.body.data.map((airline: any) => airline.iataCode);
      expect(iataCodes).toContain('AA');
      expect(iataCodes).toContain('AS');
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    it('should return single airline for exact match', async () => {
      const response = await request(app)
        .get('/airlines?query=DL')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('DL');
      expect(response.body.data[0].name).toBe('Delta Air Lines');
    });

    it('should return empty array for non-matching query', async () => {
      const response = await request(app)
        .get('/airlines?query=ZZ')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle case-insensitive searches', async () => {
      const response = await request(app)
        .get('/airlines?query=ua')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('UA');
    });

    it('should return empty array for queries longer than 2 characters', async () => {
      const response = await request(app)
        .get('/airlines?query=AAA')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /aircraft', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/aircraft')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app)
        .get('/aircraft?query=')
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching aircraft for valid query', async () => {
      const response = await request(app)
        .get('/aircraft?query=7')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const iataCodes = response.body.data.map((aircraft: any) => aircraft.iataCode);
      expect(iataCodes).toContain('737');
      expect(iataCodes).toContain('777');
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    it('should return single aircraft for exact match', async () => {
      const response = await request(app)
        .get('/aircraft?query=A38')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('A380');
      expect(response.body.data[0].name).toBe('Airbus A380');
    });

    it('should return empty array for non-matching query', async () => {
      const response = await request(app)
        .get('/aircraft?query=XYZ')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle case-insensitive searches', async () => {
      const response = await request(app)
        .get('/aircraft?query=a32')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('A320');
    });

    it('should return empty array for queries longer than 3 characters', async () => {
      const response = await request(app)
        .get('/aircraft?query=A380X')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle numeric queries', async () => {
      const response = await request(app)
        .get('/aircraft?query=777')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('777');
      expect(response.body.data[0].name).toBe('Boeing 777');
    });
  });

  describe('filterObjectsByPartialIataCode function', () => {
    // Note: Since filterObjectsByPartialIataCode is not exported, 
    // we test it indirectly through the API endpoints above.
    // This section would contain direct tests if the function was exported.

    it('should be tested through airport endpoint behavior', async () => {
      // Test partial matching
      const partialResponse = await request(app)
        .get('/airports?query=L')
        .expect(200);
      expect(partialResponse.body.data.length).toBeGreaterThan(1);

      // Test exact matching
      const exactResponse = await request(app)
        .get('/airports?query=LAX')
        .expect(200);
      expect(exactResponse.body.data).toHaveLength(1);

      // Test too long query
      const tooLongResponse = await request(app)
        .get('/airports?query=LAXX')
        .expect(200);
      expect(tooLongResponse.body.data).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should handle undefined query parameter correctly', async () => {
      const response = await request(app)
        .get('/airports')
        .expect(400);

      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .get('/airports?query=&invalid=param')
        .expect(400);

      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });
  });

  describe('Response headers', () => {
    it('should set correct content-type headers', async () => {
      const healthResponse = await request(app).get('/health');
      expect(healthResponse.headers['content-type']).toMatch(/application\/json/);

      const airportsResponse = await request(app).get('/airports?query=J');
      expect(airportsResponse.headers['content-type']).toMatch(/application\/json/);

      const airlinesResponse = await request(app).get('/airlines?query=A');
      expect(airlinesResponse.headers['content-type']).toMatch(/application\/json/);

      const aircraftResponse = await request(app).get('/aircraft?query=7');
      expect(aircraftResponse.headers['content-type']).toMatch(/application\/json/);
    });

    it('should set correct cache-control headers', async () => {
      const healthResponse = await request(app).get('/health');
      expect(healthResponse.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');

      const airportsResponse = await request(app).get('/airports?query=J');
      expect(airportsResponse.headers['cache-control']).toBe('public, max-age=86400');

      const airlinesResponse = await request(app).get('/airlines?query=A');
      expect(airlinesResponse.headers['cache-control']).toBe('public, max-age=86400');

      const aircraftResponse = await request(app).get('/aircraft?query=7');
      expect(aircraftResponse.headers['cache-control']).toBe('public, max-age=86400');
    });
  });

  describe('Non-existent endpoints', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    it('should handle POST requests to GET endpoints', async () => {
      await request(app)
        .post('/airports')
        .expect(404);
    });
  });
});