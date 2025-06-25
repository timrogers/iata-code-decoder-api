// Global test setup for Jest
const dotenv = require('dotenv');

// Load environment variables for testing
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '3000';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Console overrides for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console.log during tests unless running with --verbose
if (!process.argv.includes('--verbose')) {
  console.log = jest.fn();
}

// Always show console.error for debugging
console.error = originalConsoleError;

// Global test utilities
global.testUtils = {
  // Helper to restore console for specific tests
  restoreConsole: () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  },
  
  // Helper to suppress console for specific tests
  suppressConsole: () => {
    console.log = jest.fn();
    console.error = jest.fn();
  }
};

// Global cleanup
afterEach(() => {
  // Clean up any mocks
  jest.clearAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean exit for tests
beforeAll(() => {
  // Ensure clean state
});

afterAll(() => {
  // Clean shutdown
});