// Global test setup
// Suppress console.log during tests for cleaner output
global.console = {
  ...console,
  log: jest.fn(),
};