import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Ensure both timeZone and time_zone are present for schema compliance and
  // backward compatibility. cameliseKeys handles the snake_case to camelCase
  // conversion, but we need both.
  const result = {
    ...camelisedAirport,
    time_zone: (airport as { time_zone: string }).time_zone,
  };

  if (result.city) {
    return Object.assign(result, {
      city: cameliseKeys(result.city),
    }) as Airport;
  } else {
    return result as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
