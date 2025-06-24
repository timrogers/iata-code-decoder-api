import { Airport, Airline, Aircraft } from './types.js';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { createSearchIndex, SearchIndex, getIndexStats } from './search-index.js';

export interface DataIndexes {
  airports: SearchIndex;
  airlines: SearchIndex;
  aircraft: SearchIndex;
}

export interface DataStats {
  airports: {
    total: number;
    indexStats: ReturnType<typeof getIndexStats>;
  };
  airlines: {
    total: number;
    indexStats: ReturnType<typeof getIndexStats>;
  };
  aircraft: {
    total: number;
    indexStats: ReturnType<typeof getIndexStats>;
  };
}

let dataIndexes: DataIndexes | null = null;
let dataStats: DataStats | null = null;

/**
 * Initialize search indexes for all data types
 * This should be called once at application startup
 */
export function initializeDataIndexes(): void {
  console.log('🔍 Building search indexes...');
  const startTime = Date.now();

  // Create search indexes for each data type
  const airportsIndex = createSearchIndex(AIRPORTS, 3); // 3-letter airport codes
  const airlinesIndex = createSearchIndex(AIRLINES, 2); // 2-letter airline codes  
  const aircraftIndex = createSearchIndex(AIRCRAFT, 3); // 3-letter aircraft codes

  dataIndexes = {
    airports: airportsIndex,
    airlines: airlinesIndex,
    aircraft: aircraftIndex,
  };

  // Generate statistics
  dataStats = {
    airports: {
      total: AIRPORTS.length,
      indexStats: getIndexStats(airportsIndex),
    },
    airlines: {
      total: AIRLINES.length,
      indexStats: getIndexStats(airlinesIndex),
    },
    aircraft: {
      total: AIRCRAFT.length,
      indexStats: getIndexStats(aircraftIndex),
    },
  };

  const endTime = Date.now();
  console.log(`✅ Search indexes built in ${endTime - startTime}ms`);
  console.log(`📊 Data stats:`, {
    airports: `${dataStats.airports.total} entries, ${dataStats.airports.indexStats.totalMemoryEntries} index entries`,
    airlines: `${dataStats.airlines.total} entries, ${dataStats.airlines.indexStats.totalMemoryEntries} index entries`,
    aircraft: `${dataStats.aircraft.total} entries, ${dataStats.aircraft.indexStats.totalMemoryEntries} index entries`,
  });
}

/**
 * Get initialized data indexes
 * @returns DataIndexes or throws error if not initialized
 */
export function getDataIndexes(): DataIndexes {
  if (!dataIndexes) {
    throw new Error('Data indexes not initialized. Call initializeDataIndexes() first.');
  }
  return dataIndexes;
}

/**
 * Get data statistics
 * @returns DataStats or null if not initialized
 */
export function getDataStats(): DataStats | null {
  return dataStats;
}

/**
 * Check if indexes are initialized
 * @returns boolean
 */
export function isInitialized(): boolean {
  return dataIndexes !== null;
}