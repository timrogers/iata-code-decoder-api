export interface City {
  name: string | null;
  id: string | null;
  iataCode: string | null;
  iataCountryCode: string | null;
}

export interface Airport {
  time_zone: string;
  name: string | null;
  longitude: number | null;
  latitude: number | null;
  id: string | null;
  icaoCode: string | null;
  iataCode: string | null;
  iataCountryCode: string | null;
  cityName: string | null;
  city: City | null;
}

export interface Aircraft {
  iataCode: string | null;
  id: string | null;
  name: string | null;
}

export interface Airline {
  id: string | null;
  name: string | null;
  iataCode: string | null;
  logoSymbolUrl?: string | null;
  logoLockupUrl?: string | null;
  conditionsOfCarriageUrl?: string | null;
}

export interface ObjectWithIataCode {
  iataCode: string | null;
}

export interface Keyable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
