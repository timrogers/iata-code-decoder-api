# IATA Code Decoder API - Comprehensive Filtering Guide

## Overview

The IATA Code Decoder API now supports an extensive range of filters across all endpoints, allowing for precise data retrieval and complex search scenarios.

## Common Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 1000)

### Sorting
- `sortBy`: Field to sort by (varies by endpoint)
- `sortOrder`: `asc` or `desc` (default: `asc`)

### Search Behavior
- `exact`: Set to `true` for exact matching instead of partial matching

## Airports Endpoint (`/airports`)

### Basic Filters
- `query`: Legacy parameter for IATA code search
- `iataCode`: Airport IATA code (e.g., "LAX", "JFK")
- `iataCodes`: Multiple IATA codes (comma-separated: "LAX,JFK,LHR")
- `icaoCode`: Airport ICAO code (e.g., "KLAX")
- `name`: Airport name (partial matching: "International")
- `city`: City name (partial matching: "Angeles")

### Geographic Filters
- `countryCode`: Two-letter country code ("US", "GB")
- `minLatitude`: Minimum latitude (-90 to 90)
- `maxLatitude`: Maximum latitude (-90 to 90) 
- `minLongitude`: Minimum longitude (-180 to 180)
- `maxLongitude`: Maximum longitude (-180 to 180)

### Sortable Fields
- `iataCode`, `name`, `cityName`, `iataCountryCode`, `latitude`, `longitude`

### Examples

```bash
# Search for airports by IATA code
GET /airports?iataCode=LAX

# Find airports in a specific country
GET /airports?countryCode=US&limit=100

# Search airports by city name
GET /airports?city=London&sortBy=name

# Geographic search (airports in California-ish)
GET /airports?minLatitude=32&maxLatitude=42&minLongitude=-125&maxLongitude=-114

# Multiple IATA codes
GET /airports?iataCodes=LAX,JFK,LHR&sortBy=name

# Complex search with pagination
GET /airports?countryCode=US&name=International&page=2&limit=25&sortBy=name&sortOrder=desc

# Exact matching
GET /airports?iataCode=LAX&exact=true
```

## Airlines Endpoint (`/airlines`)

### Basic Filters
- `query`: Legacy parameter for IATA code search
- `iataCode`: Airline IATA code (e.g., "AA", "BA")
- `name`: Airline name (partial matching: "American")

### Feature Filters
- `hasLogo`: Set to `true` to only return airlines with logos

### Sortable Fields
- `iataCode`, `name`

### Examples

```bash
# Search for airlines by IATA code
GET /airlines?iataCode=AA

# Find airlines by name
GET /airlines?name=American

# Airlines with logos only
GET /airlines?hasLogo=true&sortBy=name

# Paginated results
GET /airlines?name=Air&page=1&limit=20&sortBy=iataCode
```

## Aircraft Endpoint (`/aircraft`)

### Basic Filters
- `query`: Legacy parameter for IATA code search
- `iataCode`: Aircraft IATA code (e.g., "320", "77W")
- `name`: Aircraft name (partial matching: "Boeing")
- `manufacturer`: Manufacturer name (partial matching: "Airbus")

### Sortable Fields
- `iataCode`, `name`

### Examples

```bash
# Search for aircraft by IATA code
GET /aircraft?iataCode=320

# Find Boeing aircraft
GET /aircraft?manufacturer=Boeing&sortBy=name

# Search by aircraft name
GET /aircraft?name=737&limit=50

# Exact IATA code matching
GET /aircraft?iataCode=77W&exact=true
```

## Filter Discovery Endpoints

### Get Available Filters for Airports
```bash
GET /filters/airports
```

Returns:
```json
{
  "data": {
    "availableFilters": ["query", "iataCode", "countryCode", ...],
    "countryCodes": ["AD", "AE", "AF", ...],
    "timeZones": ["Africa/Abidjan", "Africa/Accra", ...],
    "sortableFields": ["iataCode", "name", ...]
  }
}
```

### Get Available Filters for Airlines
```bash
GET /filters/airlines
```

### Get Available Filters for Aircraft
```bash
GET /filters/aircraft
```

Returns manufacturer information and available filter options.

## Response Format

All endpoints now return data in a consistent format with pagination information:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filter Combination Examples

### Complex Airport Search
```bash
# Find large international airports in Europe
GET /airports?countryCode=GB,FR,DE&name=International&hasIcaoCode=true&sortBy=name

# Airports near New York City area
GET /airports?minLatitude=40.0&maxLatitude=41.0&minLongitude=-75.0&maxLongitude=-73.0
```

### Multi-Criteria Airline Search
```bash
# Major US airlines with logos
GET /airlines?name=Airlines&hasLogo=true&sortBy=name
```

### Aircraft Type Search
```bash
# All Boeing wide-body aircraft
GET /aircraft?manufacturer=Boeing&name=777,747,787&sortBy=iataCode
```

## Error Handling

The API returns appropriate error messages for:
- Missing required parameters
- Invalid filter values
- Server errors during filtering

Example error response:
```json
{
  "data": {
    "error": "A search query must be provided via the `query` querystring parameter"
  }
}
```

## Performance Notes

- Use pagination (`limit` parameter) for large result sets
- Geographic filters are optimized for reasonable ranges
- Exact matching (`exact=true`) is faster than partial matching
- Results are cached for 24 hours for optimal performance

## Migration from Simple API

The legacy `query` parameter is still supported for backward compatibility:

```bash
# Old way (still works)
GET /airports?query=LAX

# New way (more flexible)
GET /airports?iataCode=LAX&exact=true
```