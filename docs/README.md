# IATA Code Decoder API Documentation

This directory contains the OpenAPI specification and generated documentation for the IATA Code Decoder API.

## OpenAPI Specification

The API is documented using OpenAPI 3.0.3 specification, available in two formats:

- **YAML format**: [`../openapi.yaml`](../openapi.yaml) - Human-readable format
- **JSON format**: [`../openapi.json`](../openapi.json) - Machine-readable format

## API Overview

The IATA Code Decoder API provides endpoints to search for:

- **Airports** by IATA code (3 characters)
- **Airlines** by IATA code (2 characters) 
- **Aircraft** by IATA code (typically 3 characters)

All search endpoints support partial matching and are case-insensitive.

## Base URLs

- **Production**: `https://iata-code-decoder-api.herokuapp.com`
- **Local Development**: `http://localhost:3000`

## Available Scripts

### Validate OpenAPI Specification

```bash
# Validate YAML format
npm run docs:validate

# Validate JSON format  
npm run docs:validate-json
```

### Serve Interactive Documentation

Serve the OpenAPI documentation locally using Swagger UI:

```bash
npm run docs:serve
```

This will start a local server on `http://localhost:3001` with interactive API documentation.

### Generate Static Documentation

Generate static HTML documentation using ReDoc:

```bash
npm run docs:generate
```

This creates `docs/index.html` with a beautiful, static documentation page.

## Quick Examples

### Search for airports starting with "LH"

```bash
curl "https://iata-code-decoder-api.herokuapp.com/airports?query=LH"
```

### Search for airlines starting with "B"

```bash
curl "https://iata-code-decoder-api.herokuapp.com/airlines?query=B"
```

### Search for aircraft with code "737"

```bash
curl "https://iata-code-decoder-api.herokuapp.com/aircraft?query=737"
```

### Health check

```bash
curl "https://iata-code-decoder-api.herokuapp.com/health"
```

## Response Format

All successful responses return data in the following format:

```json
{
  "data": [
    // Array of matching results
  ]
}
```

Error responses (when query parameter is missing):

```json
{
  "data": {
    "error": "A search query must be provided via the `query` querystring parameter"
  }
}
```

## Caching

- All search endpoints (`/airports`, `/airlines`, `/aircraft`) are cached for 24 hours
- The health endpoint (`/health`) is not cached

## Using the OpenAPI Specification

### Code Generation

You can use the OpenAPI specification to generate client libraries in various programming languages:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o clients/typescript

# Generate Python client
openapi-generator-cli generate -i openapi.yaml -g python -o clients/python

# Generate Java client
openapi-generator-cli generate -i openapi.yaml -g java -o clients/java
```

### API Testing

Import the OpenAPI specification into tools like:

- **Postman**: File → Import → Select `openapi.yaml`
- **Insomnia**: Create → Import from File → Select `openapi.yaml`
- **HTTPie**: `http --print=HhBb POST https://iata-code-decoder-api.herokuapp.com/airports query==LH`

### Integration with API Gateways

The OpenAPI specification can be imported into:

- AWS API Gateway
- Azure API Management
- Google Cloud Endpoints
- Kong Gateway
- And many other API management platforms

## Contributing

When making changes to the API:

1. Update the OpenAPI specification files (`openapi.yaml` and `openapi.json`)
2. Validate the changes: `npm run docs:validate`
3. Regenerate documentation: `npm run docs:generate`
4. Test the API endpoints against the specification

## License

This documentation is licensed under the same [MIT License](../LICENSE.md) as the API itself.