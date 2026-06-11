import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // We add both timeZone and time_zone to the airport object to ensure
  // that we satisfy the response schema while maintaining backward
  // compatibility.
  const airportWithBothTimeZones = Object.assign({}, camelisedAirport, {
    time_zone: (airport as Record<string, unknown>).time_zone,
    timeZone: (airport as Record<string, unknown>).time_zone,
  });

  if (airportWithBothTimeZones.city) {
    return Object.assign(airportWithBothTimeZones, {
      city: cameliseKeys(airportWithBothTimeZones.city),
    }) as Airport;
  } else {
    return airportWithBothTimeZones as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
