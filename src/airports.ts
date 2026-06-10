import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Record<string, unknown>;

  // Restore time_zone to maintain the API contract and avoid a breaking change
  // while still benefiting from camelization of other keys.
  if (camelisedAirport.timeZone) {
    camelisedAirport.time_zone = camelisedAirport.timeZone;
    delete camelisedAirport.timeZone;
  }

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as unknown as Airport;
  } else {
    return camelisedAirport as unknown as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
