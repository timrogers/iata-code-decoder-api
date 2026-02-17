/**
 * Example of optimized API implementation with prefix indexing
 * This demonstrates the performance improvements without modifying the main API
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyCompress from '@fastify/compress';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { buildPrefixIndex, lookupByPrefix, getIndexStats } from './indexer.js';

const app: FastifyInstance = Fastify({ logger: true });

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};

// Build indexes at startup
console.time('Index building');
const AIRPORT_INDEX = buildPrefixIndex(AIRPORTS, 3);
const AIRLINE_INDEX = buildPrefixIndex(AIRLINES, 2);
const AIRCRAFT_INDEX = buildPrefixIndex(AIRCRAFT, 3);
console.timeEnd('Index building');

// Log index statistics
console.log('Airport Index:', getIndexStats(AIRPORT_INDEX));
console.log('Airline Index:', getIndexStats(AIRLINE_INDEX));
console.log('Aircraft Index:', getIndexStats(AIRCRAFT_INDEX));

// Register compression with optimized settings
await app.register(fastifyCompress, {
  threshold: 512, // Compress responses > 512 bytes
  encodings: ['gzip', 'deflate'], // Remove brotli for faster compression
});

// Query parameter interface with limit support
interface QueryParams {
  query?: string;
  limit?: number;
}

// Response schemas for fast serialization
const airportItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    iataCode: { type: 'string' },
    icaoCode: { type: 'string' },
    name: { type: 'string' },
    cityName: { type: 'string' },
    iataCountryCode: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    timeZone: { type: 'string' },
  },
};

const dataResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: airportItemSchema,
    },
    total: { type: 'number' },
    returned: { type: 'number' },
  },
};

const queryStringSchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
  },
};

// Health endpoint
app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  reply.header('Content-Type', 'application/json');
  reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return { success: true };
});

// Optimized airports endpoint
app.get<{ Querystring: QueryParams }>(
  '/airports',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: dataResponseSchema,
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    }

    const query = request.query.query;
    const limit = request.query.limit || 50;

    // Use O(1) index lookup instead of O(n) filter
    const allResults = lookupByPrefix(AIRPORT_INDEX, query, 3);
    const results = allResults.slice(0, limit);

    return {
      data: results,
      total: allResults.length,
      returned: results.length,
    };
  }
);

// Optimized airlines endpoint
app.get<{ Querystring: QueryParams }>(
  '/airlines',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: dataResponseSchema,
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    // Require query parameter (don't return all airlines)
    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    }

    const query = request.query.query;
    const limit = request.query.limit || 50;

    // Use O(1) index lookup
    const allResults = lookupByPrefix(AIRLINE_INDEX, query, 2);
    const results = allResults.slice(0, limit);

    return {
      data: results,
      total: allResults.length,
      returned: results.length,
    };
  }
);

// Optimized aircraft endpoint
app.get<{ Querystring: QueryParams }>(
  '/aircraft',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: dataResponseSchema,
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    }

    const query = request.query.query;
    const limit = request.query.limit || 50;

    // Use O(1) index lookup
    const allResults = lookupByPrefix(AIRCRAFT_INDEX, query, 3);
    const results = allResults.slice(0, limit);

    return {
      data: results,
      total: allResults.length,
      returned: results.length,
    };
  }
);

export default app;
