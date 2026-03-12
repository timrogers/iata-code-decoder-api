import { Airport } from './types.js';
// Data is pre-generated with camelCase keys — no runtime transformation needed
import AIRPORTS from './../data/airports.json' with { type: 'json' };

export { AIRPORTS };
export type { Airport };
