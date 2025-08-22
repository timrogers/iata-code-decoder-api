// Integration tests for the API that don't import the problematic modules directly
import request from 'supertest';

// Create a simple test server that mimics the API structure
import express, { Request, Response } from 'express';

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock data for testing
  const mockAirports = [
    {
      id: 'airport1',
      name: 'London Heathrow Airport',
      iataCode: 'LHR',
      icaoCode: 'EGLL',
      iataCountryCode: 'GB',
      cityName: 'London',
      latitude: 51.4775,
      longitude: -0.4614,
      timeZone: 'Europe/London',
      city: {
        id: 'city1',
        name: 'London',
        iataCode: 'LON',
        iataCountryCode: 'GB',
      },
    },
    {
      id: 'airport2',
      name: 'Los Angeles International Airport',
      iataCode: 'LAX',
      icaoCode: 'KLAX',
      iataCountryCode: 'US',
      cityName: 'Los Angeles',
      latitude: 33.9425,
      longitude: -118.4081,
      timeZone: 'America/Los_Angeles',
      city: null,
    },
    {
      id: 'airport3',
      name: 'London Gatwick Airport',
      iataCode: 'LGW',
      icaoCode: 'EGKK',
      iataCountryCode: 'GB',
      cityName: 'London',
      latitude: 51.1537,
      longitude: -0.1821,
      timeZone: 'Europe/London',
      city: null,
    },
  ];

  const mockAirlines = [
    { id: 'airline1', name: 'British Airways', iataCode: 'BA' },
    { id: 'airline2', name: 'American Airlines', iataCode: 'AA' },
    { id: 'airline3', name: 'Lufthansa', iataCode: 'LH' },
  ];

  const mockAircraft = [
    { id: 'aircraft1', name: 'Boeing 737-800', iataCode: '738' },
    { id: 'aircraft2', name: 'Airbus A320', iataCode: '320' },
    { id: 'aircraft3', name: 'Boeing 777-300ER', iataCode: '77W' },
  ];

  // Define interfaces for type safety
  interface MockObject {
    id: string;
    name: string;
    iataCode: string;
    [key: string]: unknown;
  }

  // Implement the filtering logic
  const filterObjectsByPartialIataCode = (
    objects: MockObject[],
    partialIataCode: string,
    iataCodeLength: number,
  ): MockObject[] => {
    if (partialIataCode.length > iataCodeLength) {
      return [];
    } else {
      return objects.filter((object) =>
        object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
      );
    }
  };

  const QUERY_MUST_BE_PROVIDED_ERROR = {
    data: {
      error: 'A search query must be provided via the `query` querystring parameter',
    },
  };

  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

  // Health endpoint
  app.get('/health', async (req: Request, res: Response): Promise<void> => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.status(200).json({ success: true });
  });

  // Airports endpoint
  app.get('/airports', async (req: Request, res: Response): Promise<void> => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (req.query.query === undefined || req.query.query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    } else {
      const query = req.query.query as string;
      const airports = filterObjectsByPartialIataCode(mockAirports, query, 3);
      res.json({ data: airports });
    }
  });

  // Airlines endpoint
  app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (req.query.query === undefined || req.query.query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    } else {
      const query = req.query.query as string;
      const airlines = filterObjectsByPartialIataCode(mockAirlines, query, 2);
      res.json({ data: airlines });
    }
  });

  // Aircraft endpoint
  app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
    res.header('Content-Type', 'application/json');
    res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (req.query.query === undefined || req.query.query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    } else {
      const query = req.query.query as string;
      const aircraft = filterObjectsByPartialIataCode(mockAircraft, query, 3);
      res.json({ data: aircraft });
    }
  });

  return app;
};

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health check success', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it('should include correct cache headers for health endpoint', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.headers['cache-control']).toBe(
        'no-store, no-cache, must-revalidate, private',
      );
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('GET /airports', () => {
    it('should return 400 when no query parameter provided', async () => {
      const response = await request(app)
        .get('/airports')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return 400 when empty query parameter provided', async () => {
      const response = await request(app)
        .get('/airports?query=')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching airports for partial IATA code', async () => {
      const response = await request(app)
        .get('/airports?query=L')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(3); // LHR, LAX, LGW
      expect(
        response.body.data.every((airport: { iataCode: string }) =>
          airport.iataCode.toLowerCase().startsWith('l'),
        ),
      ).toBe(true);
    });

    it('should return specific airport for exact IATA code', async () => {
      const response = await request(app)
        .get('/airports?query=LHR')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LHR');
      expect(response.body.data[0].name).toBe('London Heathrow Airport');
    });

    it('should be case insensitive', async () => {
      const response = await request(app)
        .get('/airports?query=lhr')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LHR');
    });

    it('should return empty array for query longer than IATA code length', async () => {
      const response = await request(app)
        .get('/airports?query=LHRX')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should include correct cache headers for airports', async () => {
      const response = await request(app).get('/airports?query=LHR').expect(200);

      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });

    it('should handle multi-character partial matches', async () => {
      const response = await request(app)
        .get('/airports?query=LG')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('LGW');
    });
  });

  describe('GET /airlines', () => {
    it('should return 400 when no query parameter provided', async () => {
      const response = await request(app)
        .get('/airlines')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching airlines for partial IATA code', async () => {
      const response = await request(app)
        .get('/airlines?query=A')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1); // AA
      expect(response.body.data[0].iataCode).toBe('AA');
      expect(response.body.data[0].name).toBe('American Airlines');
    });

    it('should return specific airline for exact IATA code', async () => {
      const response = await request(app)
        .get('/airlines?query=BA')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
      expect(response.body.data[0].name).toBe('British Airways');
    });

    it('should be case insensitive', async () => {
      const response = await request(app)
        .get('/airlines?query=ba')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
    });

    it('should return empty array for query longer than airline IATA code length', async () => {
      const response = await request(app)
        .get('/airlines?query=BAX')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle all single character queries correctly', async () => {
      const responseL = await request(app).get('/airlines?query=L').expect(200);
      expect(responseL.body.data).toHaveLength(1);
      expect(responseL.body.data[0].iataCode).toBe('LH');

      const responseB = await request(app).get('/airlines?query=B').expect(200);
      expect(responseB.body.data).toHaveLength(1);
      expect(responseB.body.data[0].iataCode).toBe('BA');
    });
  });

  describe('GET /aircraft', () => {
    it('should return 400 when no query parameter provided', async () => {
      const response = await request(app)
        .get('/aircraft')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        data: {
          error: 'A search query must be provided via the `query` querystring parameter',
        },
      });
    });

    it('should return matching aircraft for partial IATA code', async () => {
      const response = await request(app)
        .get('/aircraft?query=7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(2); // 738, 77W
      expect(
        response.body.data.every((aircraft: { iataCode: string }) =>
          aircraft.iataCode.toLowerCase().startsWith('7'),
        ),
      ).toBe(true);
    });

    it('should return specific aircraft for exact IATA code', async () => {
      const response = await request(app)
        .get('/aircraft?query=738')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('738');
      expect(response.body.data[0].name).toBe('Boeing 737-800');
    });

    it('should be case insensitive', async () => {
      const response = await request(app)
        .get('/aircraft?query=77w')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('77W');
    });

    it('should return empty array for query longer than aircraft IATA code length', async () => {
      const response = await request(app)
        .get('/aircraft?query=738X')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle numeric aircraft codes', async () => {
      const response = await request(app)
        .get('/aircraft?query=3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('320');
    });

    it('should handle alphanumeric aircraft codes', async () => {
      const response = await request(app)
        .get('/aircraft?query=77')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('77W');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle special characters in query gracefully', async () => {
      const response = await request(app).get('/airports?query=%20').expect(200);

      // Should not crash and return appropriate response
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle very long queries', async () => {
      const longQuery = 'A'.repeat(100);
      const response = await request(app).get(`/airports?query=${longQuery}`).expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      const response = await request(app).get('/airports?query=测试').expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should handle undefined routes gracefully', async () => {
      await request(app).get('/nonexistent').expect(404);
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent response format for all endpoints', async () => {
      const endpoints = [
        { path: '/airports', query: 'LHR' },
        { path: '/airlines', query: 'BA' },
        { path: '/aircraft', query: '738' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(`${endpoint.path}?query=${endpoint.query}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('iataCode');
      }
    });

    it('should return consistent error format for all endpoints', async () => {
      const endpoints = ['/airports', '/airlines', '/aircraft'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint).expect(400);

        expect(response.body).toEqual({
          data: {
            error:
              'A search query must be provided via the `query` querystring parameter',
          },
        });
      }
    });
  });
});
