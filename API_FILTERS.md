# IATA Code Decoder API - Comprehensive Filtering Guide

This API provides exhaustive filtering capabilities for airports, airlines, and aircraft data. The filtering system supports text search, exact matching, range queries, boolean filters, sorting, and pagination.

## Base URL
All examples assume the API is running on `http://localhost:3000`

## Common Parameters

These parameters are available across all endpoints:

### Pagination
- `limit` (number): Number of results to return (default: 100, max: 1000)
- `offset` (number): Number of results to skip (default: 0)

### Sorting
- `sortBy` (string): Field name to sort by (any field in the data)
- `sortOrder` (string): Sort direction - "asc" or "desc" (default: "asc")

### Full-Text Search
- `query` (string): Search across all text fields in the dataset

## Airports Endpoint (`/airports`)

### Available Filters

#### Text Filters
- `query` - Full-text search across all airport fields
- `iataCode` - Filter by IATA airport code (partial matching)
- `icaoCode` - Filter by ICAO airport code (partial matching)
- `name` - Filter by airport name (partial matching)
- `cityName` - Filter by city name (partial matching)
- `country` - Filter by country code (2-letter ISO)
- `timezone` - Filter by timezone (partial matching)

#### Geographic Filters
- `minLatitude` (number) - Minimum latitude for bounding box
- `maxLatitude` (number) - Maximum latitude for bounding box
- `minLongitude` (number) - Minimum longitude for bounding box
- `maxLongitude` (number) - Maximum longitude for bounding box

#### Boolean Filters
- `hasIcaoCode` (boolean) - Filter airports with/without ICAO codes
- `hasCity` (boolean) - Filter airports with/without city information

### Examples

```
# Search for airports containing "London"
GET /airports?query=London&limit=10

# Get all UK airports sorted by name
GET /airports?country=GB&sortBy=name

# Find airports with ICAO codes, limited to 50 results
GET /airports?hasIcaoCode=true&limit=50

# Geographic search: airports in a specific region
GET /airports?minLatitude=51&maxLatitude=52&minLongitude=-1&maxLongitude=0

# Complex search: Large UK airports with ICAO codes
GET /airports?country=GB&hasIcaoCode=true&sortBy=name&sortOrder=asc

# Pagination example
GET /airports?limit=25&offset=100&sortBy=cityName
```

## Airlines Endpoint (`/airlines`)

### Available Filters

#### Text Filters
- `query` - Full-text search across all airline fields
- `iataCode` - Filter by IATA airline code (partial matching)
- `name` - Filter by airline name (partial matching)

### Examples

```
# Search for airlines containing "British"
GET /airlines?query=British&sortBy=name

# Find airlines with "BA" in their IATA code
GET /airlines?iataCode=BA

# Paginated list of all airlines
GET /airlines?limit=25&offset=50&sortBy=name&sortOrder=asc

# Search for airlines with "Airways" in their name
GET /airlines?name=Airways&limit=20
```

## Aircraft Endpoint (`/aircraft`)

### Available Filters

#### Text Filters
- `query` - Full-text search across all aircraft fields
- `iataCode` - Filter by IATA aircraft code (partial matching)
- `name` - Filter by aircraft name (partial matching)
- `manufacturer` - Filter by manufacturer (auto-extracted from name)

### Examples

```
# Search for Boeing aircraft
GET /aircraft?manufacturer=Boeing&limit=20

# Find aircraft with "737" in the name or code
GET /aircraft?query=737&sortBy=name

# Search for wide-body aircraft
GET /aircraft?query=wide&sortBy=manufacturer

# Get all Airbus aircraft sorted by name
GET /aircraft?manufacturer=Airbus&sortBy=name&sortOrder=asc

# Pagination through all aircraft
GET /aircraft?limit=50&offset=200&sortBy=manufacturer
```

## Filter Documentation Endpoint (`/filters`)

Get comprehensive documentation about all available filters:

```
GET /filters
```

This endpoint returns:
- Complete filter documentation with descriptions and examples
- Available filter parameters for each endpoint
- Example URLs demonstrating various filtering scenarios

## Response Format

### Standard Response
When using the new filtering system, responses include:

```json
{
  "data": [...], // Filtered results
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "hasNext": true,
    "hasPrevious": false
  },
  "filters": {
    "applied": {
      "country": "GB",
      "hasIcaoCode": true
    },
    "available": [
      "query", "iataCode", "icaoCode", "name", 
      "cityName", "country", "timezone",
      "minLatitude", "maxLatitude", "minLongitude", 
      "maxLongitude", "hasIcaoCode", "hasCity",
      "limit", "offset", "sortBy", "sortOrder"
    ]
  }
}
```

### Legacy Response
When using only the `query` parameter (for backward compatibility):

```json
{
  "data": [...] // Simple array of results
}
```

## Advanced Filtering Techniques

### Geographic Bounding Box
Search for airports within a specific geographic region:

```
GET /airports?minLatitude=40&maxLatitude=42&minLongitude=-75&maxLongitude=-73
```

### Combined Text and Boolean Filters
Find airports in a specific country that have complete data:

```
GET /airports?country=US&hasIcaoCode=true&hasCity=true&sortBy=name
```

### Manufacturer-Based Aircraft Search
The aircraft endpoint automatically extracts manufacturer information:

```
GET /aircraft?manufacturer=Boeing&name=737&sortBy=name
```

### Pagination with Filtering
Efficiently browse large filtered datasets:

```
GET /airports?country=US&limit=50&offset=150&sortBy=cityName
```

## Filter Behavior

### Text Matching
- All text filters use case-insensitive partial matching
- Search terms can appear anywhere within the field
- The `query` parameter searches across all text fields

### Numeric Ranges
- `min*` and `max*` parameters create inclusive ranges
- Can be used independently (only min or only max)

### Boolean Filters
- `true` - Include items that have the specified field
- `false` - Include items that don't have the specified field

### Sorting
- Available for any field in the dataset
- Handles null values by placing them at the end
- String sorting is locale-aware

### Pagination
- Uses offset-based pagination
- `hasNext` and `hasPrevious` help with navigation
- Total count includes all filtered results

## Error Handling

Invalid filter parameters return detailed error information:

```json
{
  "error": "Invalid filter parameters",
  "availableFilters": ["query", "iataCode", "name", ...],
  "message": "Detailed error description"
}
```

## Backward Compatibility

The API maintains backward compatibility with the original simple query interface. If only the `query` parameter is provided, the API uses the original filtering behavior and returns the legacy response format.