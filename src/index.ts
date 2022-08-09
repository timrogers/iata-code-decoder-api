

import app from './api.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, (): void => console.log(`✈️  Airports API running on port ${PORT}`));
