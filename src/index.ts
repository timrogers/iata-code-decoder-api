import app from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✈️  IATA Code Decoder API running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
