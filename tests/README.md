# IATA Code Decoder API - Integration Test Suite

This directory contains comprehensive integration tests for the IATA Code Decoder API built with Jest and Supertest.

## Test Structure

### Test Files

- **`api.integration.test.ts`** - Main API integration tests covering server health, middleware, performance, and cross-cutting concerns
- **`airports.test.ts`** - Comprehensive tests for the `/airports` endpoint
- **`airlines.test.ts`** - Comprehensive tests for the `/airlines` endpoint  
- **`aircraft.test.ts`** - Comprehensive tests for the `/aircraft` endpoint
- **`setup.ts`** - Global test configuration and setup

### Test Categories

Each endpoint test file covers the following categories:

#### 1. **Valid Searches**
- Partial IATA code searches
- Single character searches  
- Two/three character searches
- Exact matches
- Case-insensitive searches
- Common IATA codes

#### 2. **Invalid Searches**
- Non-existent codes
- Query length validation (airports: max 3, airlines: max 2, aircraft: max 3)
- Numeric queries
- Special characters
- Empty results handling

#### 3. **Error Cases**
- Missing query parameters (400 errors)
- Empty query parameters
- Whitespace-only queries
- Proper error message formatting

#### 4. **Data Structure Validation**
- Required field presence
- Data type validation
- IATA code format validation
- Optional field handling (e.g., airline logos)
- Sorting and relevance

#### 5. **Performance & Limits**
- Rapid consecutive requests
- Concurrent request handling
- Result set size limits
- Response time validation

#### 6. **Edge Cases**
- URL encoding
- Multiple query parameters
- Leading/trailing whitespace
- Mixed alphanumeric queries

#### 7. **HTTP Protocol**
- Content-Type headers
- Cache-Control headers
- Compression support
- CORS handling

#### 8. **Data Integrity**
- Consistent results across calls
- Immutable data verification
- Cross-endpoint consistency

## API Endpoints Tested

### `/health`
- Returns `200` with `{ success: true }`
- No-cache headers set
- Fast response times

### `/airports` (3-character IATA codes)
- **Valid queries**: 1-3 characters, case-insensitive
- **Invalid queries**: >3 characters return empty array
- **Required fields**: `iataCode`, `name`, `cityName`, `iataCountryCode`
- **Data validation**: IATA codes must be exactly 3 characters, A-Z format

### `/airlines` (2-character IATA codes)  
- **Valid queries**: 1-2 characters, case-insensitive
- **Invalid queries**: >2 characters return empty array
- **Required fields**: `iataCode`, `name`, `id`
- **Optional fields**: `logo_symbol_url`, `logo_lockup_url`, `conditions_of_carriage_url`
- **Data validation**: IATA codes must be exactly 2 characters, A-Z or 0-9 format

### `/aircraft` (3-character IATA codes)
- **Valid queries**: 1-3 characters, case-insensitive  
- **Invalid queries**: >3 characters return empty array
- **Required fields**: `iataCode`, `name`, `id`
- **Data validation**: IATA codes ≤3 characters, alphanumeric

## Test Features

### Comprehensive Coverage
- **200+ test cases** across all endpoints
- **Error path testing** with proper HTTP status codes
- **Performance testing** with concurrent requests
- **Business logic validation** for IATA code filtering
- **Real-world scenarios** (Boeing/Airbus aircraft, major airlines/airports)

### Cross-Endpoint Consistency
- Consistent error handling across all endpoints
- Identical cache behavior
- Uniform response structures
- Same filtering logic patterns

### Load Testing
- Multiple concurrent requests
- Rapid sequential requests  
- Performance thresholds (health check <1s, 20 requests <5s)
- Resource usage validation

### Security & Robustness
- Input validation and sanitization
- Query parameter edge cases
- URL encoding handling
- Large payload handling

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test airports.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="health"
```

### Test Environment
- **Framework**: Jest with ts-jest for TypeScript support
- **HTTP Testing**: Supertest for API endpoint testing
- **ESM Support**: Full ES modules support with proper import/export
- **TypeScript**: Full type checking and IntelliSense support
- **Timeout**: 30 seconds for integration tests
- **Coverage**: Excludes index.ts and type definition files

### Coverage Reports
Coverage reports are generated in the `coverage/` directory with:
- **Text output** in terminal
- **LCOV format** for CI/CD integration  
- **HTML report** for detailed browsing

## Test Data

The tests use the actual data files:
- `data/airports.json` - Airport data with IATA codes
- `data/airlines.json` - Airline data with IATA codes  
- `data/aircraft.json` - Aircraft data with IATA codes

Tests are designed to work with real data while being resilient to data changes.

## Performance Benchmarks

### Expected Response Times
- **Health check**: <1 second
- **Search endpoints**: <2 seconds for typical queries
- **Concurrent requests**: 10 parallel requests should complete successfully
- **Sequential requests**: 20 sequential health checks <5 seconds

### Resource Limits
- **Airports**: <1000 results for single character search
- **Airlines**: <500 results for single character search  
- **Aircraft**: <200 results for single character search

## Error Handling

All endpoints consistently return:
- **400 Bad Request** for missing/empty query parameters
- **404 Not Found** for non-existent endpoints
- **200 OK** with empty array for no matches

Error response format:
```json
{
  "data": {
    "error": "A search query must be provided via the `query` querystring parameter"
  }
}
```

## Cache Behavior

### Health Endpoint
```
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache  
Expires: 0
```

### Search Endpoints
```
Cache-Control: public, max-age=86400
```
(24 hour cache for search results)

## Continuous Integration

These tests are designed for CI/CD environments with:
- **Deterministic results** - tests should pass consistently
- **Parallel execution** - tests can run concurrently
- **No external dependencies** - tests use only the application and its data
- **Clear failure reporting** - descriptive test names and assertions

## Contributing

When adding new tests:

1. **Follow naming conventions** - describe what is being tested
2. **Use appropriate test categories** - group related tests in describe blocks
3. **Test both success and failure cases** - ensure comprehensive coverage
4. **Validate data structures** - check required fields and types
5. **Consider edge cases** - test boundary conditions and unusual inputs
6. **Maintain performance standards** - ensure tests complete within timeout limits

## Troubleshooting

### Common Issues

**Import/Export Errors**: Ensure Jest configuration supports ESM modules
**Timeout Errors**: Increase timeout for slow tests or check for hanging promises
**Type Errors**: Verify TypeScript configuration and type definitions
**Data Errors**: Check that data files are present and properly formatted

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debugging
npm test -- --testNamePattern="should find airports" --verbose

# Check test coverage for specific files
npm run test:coverage -- --collectCoverageFrom="src/api.ts"
```