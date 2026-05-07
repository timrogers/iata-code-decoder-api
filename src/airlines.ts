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

type RawAirlineWithIataCode = RawAirline & { iata_code: string };

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: RawAirline): airline is RawAirlineWithIataCode =>
  airline.iata_code !== undefined && airline.iata_code !== null;

const airlineDataToAirline = (airline: RawAirlineWithIataCode): Airline => ({
  conditionsOfCarriageUrl: airline.conditions_of_carriage_url,
  iataCode: airline.iata_code,
  id: airline.id,
  logoLockupUrl: airline.logo_lockup_url,
  logoSymbolUrl: airline.logo_symbol_url,
  name: airline.name,
});

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    const airlineData = AIRLINES_DATA as RawAirline[];
    airlines = airlineData.filter(hasIataCode).map(airlineDataToAirline);
  }

  return airlines;
};
