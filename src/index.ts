import { buildApp } from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✈️  IATA Code Decoder API running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
