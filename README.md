# IATA Code Decoder API

A comprehensive API, written in Node.js with the Express framework, which allows you to search, filter, and retrieve detailed information about airports, airlines, and aircraft using various criteria including IATA codes, geographic coordinates, and custom filters.

This is used by my [IATA Code Decoder extension](https://github.com/timrogers/raycast-iata-code-decoder) for [Raycast](https://raycast.com).

The data in the API is cached version of the airport, airline and aircraft data from the [Duffel](https://duffel.com) API. We use a cached copy for speed because the Duffel API does not allow you to view all records in one response - you can only see up to 200 at a time.

The cached data is updated regularly thanks to the power of GitHub Actions 👼

## Features

✨ **Enhanced in v2.0** - The API now supports an exhaustive range of filtering options:

- 🔍 **Advanced Text Search** - Search across multiple fields simultaneously
- 🌍 **Geographic Filtering** - Filter airports by coordinate ranges
- 🎯 **Multiple Filter Types** - Combine filters for precise results
- 📄 **Pagination** - Efficient pagination with configurable limits
- ⬆️ **Sorting** - Sort results by any field in ascending/descending order
- 🎛️ **Field Selection** - Return only the fields you need
- ✅ **Input Validation** - Comprehensive validation with clear error messages
- 🔄 **Backward Compatibility** - Legacy simple queries still work

## Quick Examples

### Basic Usage (Legacy Compatible)
```bash
# Simple IATA code search (backward compatible)
curl "https://localhost:4000/airports?query=LHR"
curl "https://localhost:4000/airlines?query=BA"
curl "https://localhost:4000/aircraft?query=738"
```

### Advanced Filtering Examples
```bash
# Geographic search - European airports
curl "https://localhost:4000/airports?latMin=35&latMax=70&lngMin=-10&lngMax=40&limit=20"

# Airlines with logos, sorted by name
curl "https://localhost:4000/airlines?hasLogo=true&sortBy=name&limit=10"

# Boeing aircraft with selected fields only
curl "https://localhost:4000/aircraft?manufacturer=Boeing&fields=name,iataCode&sortBy=name"

# US airports in specific cities
curl "https://localhost:4000/airports?country=US&city=New&limit=15&sortBy=cityName"

# Multiple countries and field selection
curl "https://localhost:4000/airports?country=US&country=CA&fields=name,iataCode,cityName&limit=5"
```

## API Documentation

### 📍 Airports Endpoint - `/airports`

**Available Filters:**
- `query` - Text search across name, IATA code, ICAO code, city, and country
- `iataCode` - Filter by specific IATA code(s) (supports multiple values)
- `icaoCode` - Filter by specific ICAO code(s) (supports multiple values)
- `name` - Filter by airport name (partial match)
- `country` - Filter by country code(s) (supports multiple values)
- `city` - Filter by city name (partial match)
- `timezone` - Filter by timezone(s) (supports multiple values)
- `latMin/latMax` - Latitude range filtering (-90 to 90)
- `lngMin/lngMax` - Longitude range filtering (-180 to 180)

**Examples:**
```bash
# London airports
curl "/airports?query=london"

# US airports with coordinates
curl "/airports?country=US&latMin=40&latMax=45&limit=10"

# Select specific fields only
curl "/airports?country=FR&fields=name,iataCode,cityName&sortBy=name"
```

### ✈️ Airlines Endpoint - `/airlines`

**Available Filters:**
- `query` - Text search across name and IATA code
- `iataCode` - Filter by specific IATA code(s) (supports multiple values)
- `name` - Filter by airline name (partial match)
- `hasLogo` - Filter airlines with/without logos (true/false)
- `hasConditions` - Filter airlines with/without conditions of carriage (true/false)

**Examples:**
```bash
# American airlines with logos
curl "/airlines?query=american&hasLogo=true"

# Airlines sorted by name, first page
curl "/airlines?sortBy=name&limit=20&offset=0"
```

### 🛩️ Aircraft Endpoint - `/aircraft`

**Available Filters:**
- `query` - Text search across name and IATA code
- `iataCode` - Filter by specific IATA code(s) (supports multiple values)
- `name` - Filter by aircraft name (partial match)
- `manufacturer` - Filter by manufacturer(s) (supports multiple values)
- `aircraftType` - Filter by aircraft type (keyword search)

**Examples:**
```bash
# All Boeing aircraft
curl "/aircraft?manufacturer=Boeing&limit=25"

# 737 variants with minimal response
curl "/aircraft?aircraftType=737&fields=name,iataCode"
```

## Common Parameters

**Pagination:**
- `limit` - Results per page (1-1000, default: 50)
- `offset` - Number of results to skip (default: 0)

**Sorting:**
- `sortBy` - Field to sort by (name, iataCode, etc.)
- `sortOrder` - Sort direction: `asc` or `desc` (default: asc)

**Field Selection:**
- `fields` - Comma-separated list of fields to return

**Multiple Values:**
Many filters support multiple values by repeating the parameter:
```bash
# Multiple countries
curl "/airports?country=US&country=CA&country=MX"

# Multiple IATA codes
curl "/airlines?iataCode=AA&iataCode=BA&iataCode=LH"
```

## Response Format

All enhanced endpoints return:

```json
{
  "data": [...],           // Array of results
  "pagination": {
    "total": 1250,         // Total results before pagination
    "limit": 50,           // Results per page
    "offset": 0,           // Results skipped
    "hasMore": true        // More results available
  },
  "filters": {...}         // Applied filters for reference
}
```

## Interactive Documentation

Visit `/docs` endpoint for complete interactive documentation:
```bash
curl "https://localhost:4000/docs"
```

## Usage

## Running locally with Node

1. Make sure you're running Node.js v18 (v18.7.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Start the application by running `npm run dev`. You'll see a message once the app is ready to go.
4. Hit <https://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳

### Advanced Usage Examples

Try these enhanced queries:

```bash
# Geographic search for European airports
https://localhost:4000/airports?latMin=35&latMax=70&lngMin=-10&lngMax=40&limit=10

# Airlines with complete branding assets
https://localhost:4000/airlines?hasLogo=true&hasConditions=true&sortBy=name

# Airbus aircraft with minimal response data
https://localhost:4000/aircraft?manufacturer=Airbus&fields=name,iataCode&limit=20
```

### Updating cached data

The cached data is updated regularly and committed to the repository thanks to the power of GitHub Actions. You can also do this locally yourself.

1. Make sure you're running Node.js v18 (v18.7.0 is recommended).
2. Install the dependencies by running `npm install`.
3. Set your Duffel access token. Make a copy of the example `.env` file with `cp .env.example .env`, and then edit the resulting `.env` file.
4. Run `npm run generate-airports && npm run generate-airlines && npm run generate-aircraft`. Commit the result.

## Running locally with Docker

1. Build the Docker image with `docker build . -t timrogers/iata-code-decoder-api`
2. Start a container using your built Docker image by running `docker run -d -p 4000:4000 timrogers/iata-code-decoder-api`
3. Hit <https://localhost:4000/airports?query=LHR> in your browser. You'll see information about Heathrow airport 🥳
4. To stop your container - because you're done or because you want to rebuild from step 1, run `docker kill` with the container ID returned from `docker run`.

## Migration from v1.x

The API is fully backward compatible. Your existing queries will continue to work:

```bash
# v1.x style (still works)
/airports?query=LHR

# v2.0 enhanced equivalent 
/airports?iataCode=LHR&fields=name,iataCode,cityName
```

All legacy responses maintain the same format, but you can now access enhanced features by using the new filter parameters.

## Performance Notes

- All endpoints include appropriate caching headers
- Use `fields` parameter to reduce response size for better performance
- Pagination limits are enforced (max 1000 per request)
- Geographic filters are optimized for coordinate-based searches
- Text searches are case-insensitive and optimized
