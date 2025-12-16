import { cameliseKeys } from '../src/utils.js';

describe('cameliseKeys', () => {
  it('converts snake_case keys to camelCase', () => {
    const result = cameliseKeys({
      iata_code: 'LHR',
      city_name: 'London',
      iata_country_code: 'GB',
    });

    expect(result).toEqual({
      iataCode: 'LHR',
      cityName: 'London',
      iataCountryCode: 'GB',
    });
  });

  it('leaves values unchanged when camelising keys', () => {
    const input = { iata_code: 'JFK', name: 'John F. Kennedy International Airport' };

    const result = cameliseKeys(input);

    expect(result).toEqual({ iataCode: 'JFK', name: 'John F. Kennedy International Airport' });
  });
});
