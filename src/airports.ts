import { Airport } from './types';
import AIRPORTS_DATA from './../data/airports.json';
import { cameliseKeys } from './utils';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as Airport;
  } else {
    return camelisedAirport as Airport;
  }
};

export const AIRPORTS: Airport[] = AIRPORTS_DATA.map(airportDataToAirport);
