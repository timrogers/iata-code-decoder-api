import request from 'supertest';
import app from '../api.js';

// Mock all data modules with comprehensive test data
jest.mock('../airports.js', () => ({
  AIRPORTS: [
    { id: '1', name: 'John F. Kennedy International Airport', iataCode: 'JFK', city: null },
    { id: '2', name: 'LaGuardia Airport', iataCode: 'LGA', city: null },
    { id: '3', name: 'Los Angeles International Airport', iataCode: 'LAX', city: null },
    { id: '4', name: 'London Heathrow Airport', iataCode: 'LHR', city: null },
    { id: '5', name: 'London Gatwick Airport', iataCode: 'LGW', city: null },
    { id: '6', name: 'Newark Liberty International Airport', iataCode: 'EWR', city: null }
  ]
}));

jest.mock('../airlines.js', () => ({
  AIRLINES: [
    { id: '1', name: 'American Airlines', iataCode: 'AA' },
    { id: '2', name: 'Air Canada', iataCode: 'AC' },
    { id: '3', name: 'Delta Air Lines', iataCode: 'DL' },
    { id: '4', name: 'United Airlines', iataCode: 'UA' },
    { id: '5', name: 'British Airways', iataCode: 'BA' },
    { id: '6', name: 'Lufthansa', iataCode: 'LH' }
  ]
}));

jest.mock('../aircraft.js', () => ({
  AIRCRAFT: [
    { id: '1', name: 'Boeing 737-800', iataCode: '738' },
    { id: '2', name: 'Boeing 737-900', iataCode: '739' },
    { id: '3', name: 'Airbus A320', iataCode: '320' },
    { id: '4', name: 'Airbus A321', iataCode: '321' },
    { id: '5', name: 'Boeing 777-300ER', iataCode: '77W' },
    { id: '6', name: 'Airbus A380', iataCode: '380' }
  ]
}));

describe('Integration Tests - Complete API Functionality', () => {
  describe('Airport Search Integration', () => {
    it('should find airports starting with J', async () => {
      const response = await request(app).get('/airports?query=J');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('JFK');
    });

    it('should find multiple airports starting with L', async () => {
      const response = await request(app).get('/airports?query=L');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(4);
      const codes = response.body.data.map((airport: any) => airport.iataCode);
      expect(codes).toEqual(expect.arrayContaining(['LGA', 'LAX', 'LHR', 'LGW']));
    });

    it('should be case insensitive for airport search', async () => {
      const upperResponse = await request(app).get('/airports?query=LA');
      const lowerResponse = await request(app).get('/airports?query=la');
      
      expect(upperResponse.status).toBe(200);
      expect(lowerResponse.status).toBe(200);
      expect(upperResponse.body.data).toEqual(lowerResponse.body.data);
    });

    it('should respect 3-character limit for airports', async () => {
      const response = await request(app).get('/airports?query=JFKX');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Airline Search Integration', () => {
    it('should find airlines starting with A', async () => {
      const response = await request(app).get('/airlines?query=A');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      const codes = response.body.data.map((airline: any) => airline.iataCode);
      expect(codes).toEqual(expect.arrayContaining(['AA', 'AC']));
    });

    it('should find single airline with partial match', async () => {
      const response = await request(app).get('/airlines?query=BA');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].iataCode).toBe('BA');
    });

    it('should respect 2-character limit for airlines', async () => {
      const response = await request(app).get('/airlines?query=AAA');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Aircraft Search Integration', () => {
    it('should find aircraft starting with 7', async () => {
      const response = await request(app).get('/aircraft?query=7');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      const codes = response.body.data.map((aircraft: any) => aircraft.iataCode);
      expect(codes).toEqual(expect.arrayContaining(['738', '739', '77W']));
    });

    it('should find aircraft with specific code pattern', async () => {
      const response = await request(app).get('/aircraft?query=32');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      const codes = response.body.data.map((aircraft: any) => aircraft.iataCode);
      expect(codes).toEqual(expect.arrayContaining(['320', '321']));
    });

    it('should respect 3-character limit for aircraft', async () => {
      const response = await request(app).get('/aircraft?query=7380');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing query parameters consistently', async () => {
      const airportsResponse = await request(app).get('/airports');
      const airlinesResponse = await request(app).get('/airlines');
      const aircraftResponse = await request(app).get('/aircraft');

      expect(airportsResponse.status).toBe(400);
      expect(airlinesResponse.status).toBe(400);
      expect(aircraftResponse.status).toBe(400);

      const errorMessage = 'A search query must be provided via the `query` querystring parameter';
      expect(airportsResponse.body.data.error).toBe(errorMessage);
      expect(airlinesResponse.body.data.error).toBe(errorMessage);
      expect(aircraftResponse.body.data.error).toBe(errorMessage);
    });

    it('should handle empty query parameters consistently', async () => {
      const airportsResponse = await request(app).get('/airports?query=');
      const airlinesResponse = await request(app).get('/airlines?query=');
      const aircraftResponse = await request(app).get('/aircraft?query=');

      expect(airportsResponse.status).toBe(400);
      expect(airlinesResponse.status).toBe(400);
      expect(aircraftResponse.status).toBe(400);
    });
  });

  describe('Header and Caching Integration', () => {
    it('should set correct headers for data endpoints', async () => {
      const response = await request(app).get('/airports?query=J');
      
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toMatch(/public, max-age=86400/);
    });

    it('should set correct headers for health endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle special characters in search', async () => {
      const response = await request(app).get('/airports?query=L&');
      expect(response.status).toBe(200);
      // Should still work, treating the query as "L&"
    });

    it('should handle numeric queries', async () => {
      const response = await request(app).get('/aircraft?query=3');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return consistent response structure', async () => {
      const response = await request(app).get('/airports?query=J');
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('iataCode');
      }
    });
  });
});