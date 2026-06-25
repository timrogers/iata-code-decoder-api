import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Preserve original time_zone for backward compatibility as it's required by the schema
  const airportWithTimeZone = Object.assign(camelisedAirport, {
    time_zone: (airport as { time_zone: string }).time_zone,
  });

  if (airportWithTimeZone.city) {
    return Object.assign(airportWithTimeZone, {
      city: cameliseKeys(airportWithTimeZone.city),
    }) as Airport;
  } else {
    return airportWithTimeZone as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
