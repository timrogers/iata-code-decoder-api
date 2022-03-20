export interface City {
  name: string;
  id: string;
  iataCode: string;
  iataCountryCode: string;
}

export interface Airport {
  time_zone: string;
  name: string;
  longitude: number;
  latitude: number;
  id: string;
  icaoCode: string;
  iataCode: string;
  iataCountryCode: string;
  cityName: string;
  city: City | null;
}

export interface Aircraft {
  iataCode: string;
  id: string;
  name: string;
}

export interface Airline {
  id: string;
  name: string;
  iataCode: string;
}

export interface ObjectWithIataCode {
  iataCode: string;
}

export interface Keyable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
