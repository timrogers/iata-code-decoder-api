import { Aircraft } from './types.js';
// Data is pre-generated with camelCase keys — no runtime transformation needed
import AIRCRAFT from './../data/aircraft.json' with { type: 'json' };

export { AIRCRAFT };
export type { Aircraft };
