// Test setup file for Jest
// This file runs before each test file

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console.log to avoid noise in test output
global.console = {
  ...console,
  log: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use any available port for testing