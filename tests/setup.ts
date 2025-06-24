// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '3000';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test setup can go here
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
});