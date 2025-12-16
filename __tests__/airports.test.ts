import { AIRPORTS } from '../src/airports.js';

describe('AIRPORTS data', () => {
  it('camelises airport properties', () => {
    const airport = AIRPORTS[0];

    expect(airport).toHaveProperty('iataCode');
    expect(airport).toHaveProperty('icaoCode');
    expect(airport).not.toHaveProperty('iata_code');
    expect(airport).not.toHaveProperty('icao_code');
  });

  it('camelises nested city data when present', () => {
    const airportWithCity = AIRPORTS.find((airport) => airport.id === 'arp_org_sr');

    expect(airportWithCity?.city).toEqual({
      iataCountryCode: 'SR',
      iataCode: 'PBM',
      name: 'Paramaribo',
      id: 'cit_pbm_sr',
    });
  });
});
