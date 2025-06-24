import app from './api.js';
import dotenv from 'dotenv';
import { initializeDataIndexes } from './data-loader.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting IATA Code Decoder API...');
    
    // Initialize data indexes for optimal performance
    initializeDataIndexes();
    
    // Start the server
    app.listen(PORT, (): void => {
      console.log(`✈️  IATA Code Decoder API running on port ${PORT}`);
      console.log(`📈 Performance optimizations enabled:`);
      console.log('   • Search indexing for O(1) lookups');
      console.log('   • LRU caching for frequent queries');
      console.log('   • Rate limiting for abuse protection');
      console.log('   • Input validation and sanitization');
      console.log('   • Response compression');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

startServer();
