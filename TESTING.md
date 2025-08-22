# Testing Documentation

This project uses Jest for comprehensive test coverage of the IATA Code Decoder API.

## Test Structure

### Unit Tests
- **`utils.test.ts`** - Tests for utility functions like `cameliseKeys`
- **`types.test.ts`** - TypeScript interface validation and type compatibility tests
- **`filtering.test.ts`** - Core filtering logic tests for IATA code matching

### Integration Tests  
- **`api-integration.test.ts`** - Comprehensive API endpoint testing with mock data

## Test Coverage

The test suite covers:

1. **Utility Functions**
   - Snake case to camel case conversion
   - Edge cases and data type preservation

2. **Core Filtering Logic**
   - IATA code partial matching for airports (3-char codes)
   - IATA code partial matching for airlines (2-char codes) 
   - IATA code partial matching for aircraft (3-char codes)
   - Case insensitivity
   - Query length validation
   - Edge cases and error conditions

3. **API Endpoints**
   - `/health` - Health check endpoint
   - `/airports` - Airport lookup by IATA code
   - `/airlines` - Airline lookup by IATA code
   - `/aircraft` - Aircraft lookup by IATA code
   - Error handling and validation
   - Response format consistency
   - Cache headers verification

4. **Type Safety**
   - TypeScript interface validation
   - Type compatibility testing
   - Object structure verification

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Data

Tests use mock data to avoid dependencies on external files and provide predictable, controlled test scenarios.

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+  
- **Lines**: 80%+

## Jest Configuration

- TypeScript support via `ts-jest`
- Test environment: Node.js
- Coverage reporting: Text, LCOV, HTML
- Separate TypeScript config for tests to handle module compatibility