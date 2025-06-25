# IATA Code Decoder API Documentation

## Overview

The IATA Code Decoder API provides endpoints to search for airports, airlines, and aircraft by their IATA codes. This document covers the OpenAPI specification and how to access the API documentation.

## OpenAPI Specification

The API is fully documented using OpenAPI 3.0 specification, which provides:

- Complete endpoint documentation
- Request/response schemas
- Example requests and responses
- Parameter validation rules
- Error response formats

## Accessing the Documentation

### 1. OpenAPI Specification File

The OpenAPI specification is available in multiple formats:

- **YAML format**: [`/openapi.yaml`](openapi.yaml) or [`GET /openapi.yaml`](http://localhost:3000/openapi.yaml)
- **JSON format**: Generate using `npm run openapi:generate-json`

### 2. Interactive Documentation

Access interactive API documentation at:
- **Swagger UI**: [`GET /docs`](http://localhost:3000/docs) - Redirects to Swagger UI with loaded specification
- **Local Swagger UI**: `npm run openapi:serve`
- **ReDoc**: `npm run docs:serve`

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/health` | GET | Health check endpoint | None |
| `/airports` | GET | Search airports by IATA code | `query` (required) |
| `/airlines` | GET | Search airlines by IATA code | `query` (required) |
| `/aircraft` | GET | Search aircraft by IATA code | `query` (required) |

### Documentation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/openapi.yaml` | GET | OpenAPI specification in YAML format |
| `/docs` | GET | Redirects to interactive Swagger UI documentation |

## Search Parameters

### Airports (`/airports`)
- **Parameter**: `query` (required)
- **Format**: 1-3 letter IATA airport code
- **Example**: `LHR`, `JFK`, `DXB`
- **Pattern**: `^[A-Za-z]{1,3}$`

### Airlines (`/airlines`)
- **Parameter**: `query` (required)
- **Format**: 1-2 character IATA airline code
- **Example**: `BA`, `AA`, `QF`
- **Pattern**: `^[A-Za-z0-9]{1,2}$`

### Aircraft (`/aircraft`)
- **Parameter**: `query` (required)
- **Format**: 1-3 character IATA aircraft code
- **Example**: `738`, `A320`, `77W`
- **Pattern**: `^[A-Za-z0-9]{1,3}$`

## Response Format

### Success Response
```json
{
  "data": [
    {
      "id": "unique_identifier",
      "name": "Human readable name",
      "iataCode": "CODE",
      // ... additional fields specific to resource type
    }
  ]
}
```

### Error Response
```json
{
  "data": {
    "error": "Error message describing what went wrong"
  }
}
```

## Example Usage

### Search for London Airports
```bash
curl "https://your-api-domain.com/airports?query=L"
```

### Search for British Airways
```bash
curl "https://your-api-domain.com/airlines?query=BA"
```

### Search for Boeing 737 Aircraft
```bash
curl "https://your-api-domain.com/aircraft?query=73"
```

## Response Headers

### Caching
- **Search endpoints**: `Cache-Control: public, max-age=86400` (24 hours)
- **Health endpoint**: `Cache-Control: no-store, no-cache, must-revalidate, private`
- **Documentation endpoints**: `Cache-Control: public, max-age=86400` (24 hours)

### Content Type
- **JSON responses**: `Content-Type: application/json`
- **YAML responses**: `Content-Type: application/x-yaml`

## Development Scripts

Use these npm scripts for working with the OpenAPI specification:

```bash
# Validate the OpenAPI specification
npm run openapi:validate

# Generate JSON version from YAML
npm run openapi:generate-json

# Serve interactive Swagger UI documentation
npm run openapi:serve

# Serve ReDoc documentation with live reload
npm run docs:serve
```

## Schema Validation

The OpenAPI specification includes comprehensive schema validation:

- **Required fields**: All required fields are clearly marked
- **Data types**: Proper typing for strings, numbers, arrays, objects
- **Pattern validation**: Regex patterns for IATA codes
- **Format validation**: URI format for URLs, email format for contacts
- **Length constraints**: Min/max length for string fields

## Error Handling

The API returns appropriate HTTP status codes:

- **200 OK**: Successful request with data
- **400 Bad Request**: Missing or invalid query parameter
- **404 Not Found**: OpenAPI specification file not found
- **500 Internal Server Error**: Unexpected server errors

## API Versioning

The API is currently at version 1.0.0. Future versions will maintain backward compatibility or provide clear migration paths.

## Integration Examples

### JavaScript/TypeScript
```typescript
// Using fetch API
const response = await fetch('/airports?query=LHR');
const data = await response.json();
console.log(data.data); // Array of airport objects
```

### cURL
```bash
# Get OpenAPI spec
curl -H "Accept: application/x-yaml" http://localhost:3000/openapi.yaml

# Search for airports
curl "http://localhost:3000/airports?query=LHR"
```

### OpenAPI Code Generation

Use the OpenAPI specification to generate client SDKs:

```bash
# Generate TypeScript client
openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o ./generated-client

# Generate Python client
openapi-generator-cli generate -i openapi.yaml -g python -o ./python-client
```

## Testing the API

Use the interactive documentation to test endpoints directly in your browser:

1. Visit [`/docs`](http://localhost:3000/docs) for Swagger UI
2. Try out different endpoints with various query parameters
3. View the request/response details
4. Copy cURL commands for your own testing

## Support and Contributing

For issues, questions, or contributions:
- Repository: [timrogers/iata-code-decoder-api](https://github.com/timrogers/iata-code-decoder-api)
- Contact: Tim Rogers <me@timrogers.co.uk>
- License: MIT