import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Restore the original time_zone for backward compatibility, as cameliseKeys
  // will have turned it into timeZone
  const result = Object.assign(camelisedAirport, {
    time_zone: (airport as { time_zone: string }).time_zone,
  });

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
