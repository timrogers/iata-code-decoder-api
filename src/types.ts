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

// Filter interfaces for comprehensive filtering
export interface BaseFilters {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AirportFilters extends BaseFilters {
  query?: string;
  iataCode?: string;
  icaoCode?: string;
  name?: string;
  cityName?: string;
  country?: string;
  iataCountryCode?: string;
  timezone?: string;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  hasIcaoCode?: boolean;
  hasCity?: boolean;
}

export interface AirlineFilters extends BaseFilters {
  query?: string;
  iataCode?: string;
  name?: string;
}

export interface AircraftFilters extends BaseFilters {
  query?: string;
  iataCode?: string;
  name?: string;
  manufacturer?: string;
}

export interface FilteredResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    applied: Keyable;
    available: string[];
  };
}
