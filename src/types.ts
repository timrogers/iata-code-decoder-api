export interface City {
  name: string;
  id: string;
  iata_code: string;
  iata_country_code: string
}

export interface Airport {
  time_zone: string;
  name: string;
  longitude: number;
  latitude: number;
  id: string;
  icao_code: string;
  iata_code: string;
  iata_country_code: string;
  city_name: string;
  city: City
}