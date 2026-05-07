import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

interface RawAirline {
  conditions_of_carriage_url: string | null;
  iata_code: string | null;
  id: string;
  logo_lockup_url: string | null;
  logo_symbol_url: string | null;
  name: string;
}

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: RawAirline): boolean =>
  airline.iata_code !== undefined && airline.iata_code !== null;

const airlineDataToAirline = (airline: RawAirline): Airline =>
  ({
    conditionsOfCarriageUrl: airline.conditions_of_carriage_url,
    iataCode: airline.iata_code,
    id: airline.id,
    logoLockupUrl: airline.logo_lockup_url,
    logoSymbolUrl: airline.logo_symbol_url,
    name: airline.name,
  }) as Airline;

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = AIRLINES_DATA.filter((airline) => hasIataCode(airline as RawAirline)).map(
      (airline) => airlineDataToAirline(airline as RawAirline),
    );
  }

  return airlines;
};
