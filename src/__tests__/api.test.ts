import request from 'supertest';
import app from '../api.js';

// Mock the data modules
jest.mock('../airports.js', () => ({
  AIRPORTS: [
    { id: '1', name: 'John F. Kennedy International Airport', iataCode: 'JFK' },
    { id: '2', name: 'Los Angeles International Airport', iataCode: 'LAX' },
    { id: '3', name: 'Chicago O\'Hare International Airport', iataCode: 'ORD' },
    { id: '4', name: 'London Heathrow Airport', iataCode: 'LHR' }
  ]
}));

jest.mock('../airlines.js', () => ({
  AIRLINES: [
    { id: '1', name: 'American Airlines', iataCode: 'AA' },
    { id: '2', name: 'Delta Air Lines', iataCode: 'DL' },
    { id: '3', name: 'United Airlines', iataCode: 'UA' },
    { id: '4', name: 'British Airways', iataCode: 'BA' }
  ]
}));

jest.mock('../aircraft.js', () => ({
  AIRCRAFT: [
    { id: '1', name: 'Boeing 737-800', iataCode: '738' },
    { id: '2', name: 'Airbus A320', iataCode: '320' },
    { id: '3', name: 'Boeing 777-300ER', iataCode: '77W' },
    { id: '4', name: 'Airbus A380', iataCode: '380' }
  ]
}));

describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return 200 and success response', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });
  });

  describe('GET /airports', () => {
    it('should return filtered airports based on partial IATA code', async () => {
      const response = await request(app).get('/airports?query=J');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('JFK');
      expect(response.headers['cache-control']).toMatch(/public, max-age=86400/);
    });

    it('should return multiple airports for partial matches', async () => {
      const response = await request(app).get('/airports?query=L');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((a: any) => a.iataCode)).toEqual(['LAX', 'LHR']);
    });

    it('should be case insensitive', async () => {
      const response = await request(app).get('/airports?query=jf');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('JFK');
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/airports?query=JFKX');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airports');
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get('/airports?query=');
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });
  });

  describe('GET /airlines', () => {
    it('should return filtered airlines based on partial IATA code', async () => {
      const response = await request(app).get('/airlines?query=A');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('AA');
    });

    it('should return multiple airlines for partial matches', async () => {
      const response = await request(app).get('/airlines?query=U');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('UA');
    });

    it('should be case insensitive', async () => {
      const response = await request(app).get('/airlines?query=ba');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/airlines?query=AAA');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/airlines');
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });
  });

  describe('GET /aircraft', () => {
    it('should return filtered aircraft based on partial IATA code', async () => {
      const response = await request(app).get('/aircraft?query=7');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((a: any) => a.iataCode)).toEqual(['738', '77W']);
    });

    it('should return specific aircraft for exact partial match', async () => {
      const response = await request(app).get('/aircraft?query=32');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('320');
    });

    it('should be case insensitive', async () => {
      const response = await request(app).get('/aircraft?query=77w');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('77W');
    });

    it('should return empty array for queries longer than IATA code length', async () => {
      const response = await request(app).get('/aircraft?query=7380');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get('/aircraft');
      
      expect(response.status).toBe(400);
      expect(response.body.data.error).toBe('A search query must be provided via the `query` querystring parameter');
    });
  });

  describe('404 Routes', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown');
      
      expect(response.status).toBe(404);
    });
  });
});