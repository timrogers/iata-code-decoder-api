import { Airport } from './types';
import AIRPORTS_DATA from './../data/airports.json';
import { snakifyKeys } from './utils';

const airportDataToAirport = (airport : object): Airport => snakifyKeys(airport) as Airport;

export const AIRPORTS : Airport[] = AIRPORTS_DATA.map(airportDataToAirport);

export const getAirportByIataCode = (iataCode : string): Airport | undefined => {
  return AIRPORTS.find(airport => airport.iata_code === iataCode);
}