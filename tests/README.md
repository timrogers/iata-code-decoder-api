# Test Suite Documentation

This directory contains comprehensive unit and integration tests for the IATA Code Decoder API.

## Test Structure

### Files Overview

- **`setup.ts`** - Jest configuration and global test setup
- **`mocks/mockData.ts`** - Centralized mock data for tests
- **`utils.test.ts`** - Unit tests for utility functions
- **`aircraft.test.ts`** - Unit tests for aircraft module
- **`airlines.test.ts`** - Unit tests for airlines module  
- **`airports.test.ts`** - Unit tests for airports module
- **`api.test.ts`** - Integration tests for API endpoints
- **`filtering.test.ts`** - Unit tests for filtering logic

## Test Categories

### 1. Unit Tests

#### Utility Functions (`utils.test.ts`)
- Tests `cameliseKeys` function with various input scenarios
- Edge cases like empty objects, mixed key formats
- Type preservation across different data types

#### Data Processing Modules
- **Aircraft** (`aircraft.test.ts`): Tests data transformation and exports
- **Airlines** (`airlines.test.ts`): Tests filtering logic for IATA codes
- **Airports** (`airports.test.ts`): Tests city processing and camelCase conversion

#### Filtering Logic (`filtering.test.ts`)
- Tests the core filtering algorithm in isolation
- Validates partial matching behavior for different IATA code lengths
- Edge cases and special character handling

### 2. Integration Tests

#### API Endpoints (`api.test.ts`)
Comprehensive testing of all REST endpoints:

- **`GET /health`**: Health check endpoint
- **`GET /airports`**: Airport search with query validation
- **`GET /airlines`**: Airline search with query validation
- **`GET /aircraft`**: Aircraft search with query validation

Each endpoint tests:
- ✅ Successful responses with correct data
- ✅ Proper HTTP status codes
- ✅ Correct response headers (caching, content-type)
- ✅ Query parameter validation
- ✅ Case insensitive searching
- ✅ Partial matching behavior
- ✅ Length limit enforcement
- ✅ Error handling for missing/empty queries

## Key Test Features

### Mocking Strategy
- **Data Files**: JSON data files are mocked with controlled test data
- **Module Imports**: Uses Jest's module mocking for consistent test isolation
- **Dynamic Imports**: Ensures mocks are respected in ES module environment

### Test Data
Mock data includes representative samples:
- **3 Airports**: LHR (with city), LGA, LAX (without city data)
- **3 Airlines**: BA, LH, AA (with proper IATA filtering)
- **3 Aircraft**: 73G, 320, 738 (various code formats)

### Filtering Logic Validation
Tests validate the core algorithm that:
- Matches IATA codes by prefix (case insensitive)
- Enforces length limits (2 chars for airlines, 3 for airports/aircraft)
- Returns empty arrays for over-length queries
- Handles edge cases gracefully

### Error Scenarios
Comprehensive error testing including:
- Missing query parameters
- Empty query strings
- Invalid route handling
- Over-length query handling

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test utils.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should return airports"
```

## Coverage Goals

The test suite aims for:
- **95%+ Line Coverage**: All critical code paths tested
- **90%+ Branch Coverage**: All conditional logic tested  
- **100% Function Coverage**: All exported functions tested

Key areas covered:
- ✅ Data transformation (snake_case → camelCase)
- ✅ IATA code filtering and validation
- ✅ HTTP request/response handling
- ✅ Query parameter validation
- ✅ Error handling and status codes
- ✅ Response headers and caching
- ✅ Case sensitivity handling

## Mock Data Structure

### Airports
```typescript
{
  time_zone: string,
  name: string,
  longitude: number,
  latitude: number,
  id: string,
  icaoCode: string,
  iataCode: string,
  iataCountryCode: string,
  cityName: string,
  city: City | null
}
```

### Airlines  
```typescript
{
  id: string,
  name: string,
  iataCode: string
}
```

### Aircraft
```typescript
{
  iataCode: string,
  id: string,
  name: string
}
```

## Best Practices Implemented

1. **Isolation**: Each test runs independently with fresh mocks
2. **Descriptive Names**: Test names clearly describe expected behavior
3. **Arrange-Act-Assert**: Clear test structure
4. **Edge Case Coverage**: Tests handle boundary conditions
5. **Type Safety**: Full TypeScript support in tests
6. **Realistic Data**: Mock data mirrors real API responses

## Continuous Integration

Tests are designed to run reliably in CI environments:
- No external dependencies
- Deterministic results
- Fast execution
- Clear failure messages
- Compatible with common CI platforms