import app from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

app.listen(PORT, (): void =>
  console.log(`✈️  IATA Code Decoder API running on port ${PORT}`),
);
