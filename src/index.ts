import app from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, (): void =>
  console.log(`✈️  IATA Code Decoder API running on port ${PORT}`),
);
