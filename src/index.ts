import app, { warmDatasetCaches } from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✈️  IATA Code Decoder API running on port ${PORT}`);

    // Warm dataset caches in the background so the first request after
    // startup is fast. Errors here only impact perf, not correctness, so we
    // log and continue rather than crash the server.
    setImmediate(() => {
      try {
        warmDatasetCaches();
      } catch (err) {
        app.log.warn({ err }, 'Failed to warm dataset caches');
      }
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
