# IATA Code Decoder API - Test Suite

This directory contains comprehensive integration and unit tests for the IATA Code Decoder API project using Jest.

## Test Structure

### Integration Tests
Located in `__tests__/integration/`:

- **`api.integration.test.ts`** - Comprehensive integration tests for all API endpoints
  - Health check endpoint tests
  - Airports endpoint tests (valid/invalid requests, response structure)
  - Airlines endpoint tests (valid/invalid requests, response structure)
  - Aircraft endpoint tests (valid/invalid requests, response structure)
  - Error handling and validation
  - Performance and load testing
  - Data integrity verification

- **`edge-cases.integration.test.ts`** - Edge cases and stress tests
  - URL encoding and special characters
  - Unicode and international characters
  - Boundary conditions and length limits
  - HTTP methods and headers testing
  - Performance and load testing
  - Memory and resource management
  - Error recovery and resilience
  - Data consistency under load

### Unit Tests
Located in `__tests__/unit/`:

- **`utils.unit.test.ts`** - Unit tests for utility functions
  - `cameliseKeys` function testing with various input scenarios
  - Edge cases and performance testing for utilities

- **`data.unit.test.ts`** - Unit tests for data modules
  - Data loading and transformation verification
  - Data structure and type validation
  - Data consistency across modules
  - Dataset size and quality checks

- **`filtering.unit.test.ts`** - Unit tests for filtering logic
  - Partial IATA code matching for all endpoint types
  - Case insensitive matching
  - Length validation and constraints
  - Result ordering and consistency
  - Special characters handling
  - Performance testing of filtering

## Test Coverage

The test suite covers:

### API Endpoints
✅ `/health` - Health check endpoint  
✅ `/airports` - Airport search by IATA code  
✅ `/airlines` - Airline search by IATA code  
✅ `/aircraft` - Aircraft search by IATA code  

### Functionality
✅ Partial IATA code matching  
✅ Case insensitive search  
✅ Query parameter validation  
✅ Error handling and responses  
✅ HTTP headers and caching  
✅ Data transformation (snake_case to camelCase)  
✅ Performance and scalability  
✅ Edge cases and boundary conditions  

### Data Integrity
✅ Data loading and structure validation  
✅ IATA code format validation  
✅ Required property presence  
✅ Data type consistency  
✅ Unique ID and code verification  

## Running Tests

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

### Test Commands

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage Report
```bash
npm run test:coverage
```

#### Run Tests with Verbose Output
```bash
npm run test:verbose
```

#### Run Only Integration Tests
```bash
npm run test:integration
```

#### Run Specific Test Files
```bash
# Unit tests only
npx jest __tests__/unit/

# Integration tests only
npx jest __tests__/integration/

# Specific test file
npx jest __tests__/integration/api.integration.test.ts
```

### Test Configuration

The test suite is configured with:
- **Test Environment**: Node.js
- **Test Runner**: Jest with TypeScript support
- **HTTP Testing**: Supertest for API endpoint testing
- **Timeout**: 10 seconds per test
- **Coverage**: 80% threshold for branches, functions, lines, and statements

## Test Categories

### 🧪 **Integration Tests** (End-to-End)
- Test complete request/response cycles
- Verify API behavior with real data
- Test all endpoints with various scenarios
- Performance and load testing
- Error condition handling

### 🔬 **Unit Tests** (Component-Level)
- Test individual functions and modules
- Data transformation verification
- Filtering logic validation
- Utility function testing
- Data loading and structure tests

### 🚀 **Performance Tests**
- Response time validation
- Concurrent request handling
- Large dataset filtering
- Memory usage optimization
- Stress testing with high load

### 🛡️ **Security and Edge Cases**
- Input validation and sanitization
- URL encoding and special characters
- Unicode character handling
- Boundary condition testing
- Error recovery testing

## Test Data

Tests use the actual data files:
- `data/airports.json` - Airport data (~2.2MB)
- `data/airlines.json` - Airline data (~227KB)  
- `data/aircraft.json` - Aircraft data (~43KB)

This ensures tests run against real data and can catch data-related issues.

## Coverage Goals

- **Statements**: ≥80%
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%

## Continuous Integration

These tests are designed to run in CI/CD environments:
- Fast execution (most tests complete in <100ms)
- No external dependencies
- Deterministic results
- Comprehensive error reporting

## Writing New Tests

When adding new features or endpoints:

1. **Add Integration Tests** for new API endpoints
2. **Add Unit Tests** for new utility functions or data processing
3. **Add Edge Case Tests** for new input validation or error conditions
4. **Update Performance Tests** if new functionality affects performance
5. **Maintain Coverage** above threshold levels

### Test Naming Convention
```
describe('Feature/Component Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific when condition is met', async () => {
      // Test implementation
    });
  });
});
```

## Troubleshooting Tests

### Common Issues

**Tests timing out**:
- Increase timeout in Jest configuration
- Check for unhandled promises
- Verify test environment setup

**Import/module errors**:
- Ensure Jest configuration handles ES modules correctly
- Verify TypeScript compilation
- Check module path mappings

**Data-related test failures**:
- Verify data files are present and readable
- Check data transformation functions
- Ensure data consistency

### Debug Mode
Run tests with debug output:
```bash
npm run test:verbose
```

Or run with Node.js debugging:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Metrics

Current test suite includes:
- **100+** individual test cases
- **4** test files covering different aspects
- **Full API coverage** across all endpoints
- **Edge case coverage** for robust error handling
- **Performance benchmarks** for scalability assurance

---

For questions about the test suite or to report test-related issues, please check the project documentation or open an issue.