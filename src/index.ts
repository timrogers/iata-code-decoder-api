import app from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  console.log(`✈️  IATA Code Decoder API running on port ${PORT}`);
});
