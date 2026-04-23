import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from 'fastify';
import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { getAirports } from './airports.js';
import { getAirlines } from './airlines.js';
import { getAircraft } from './aircraft.js';
import { ObjectWithIataCode } from './types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  isInitializeRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { IncomingMessage, ServerResponse } from 'node:http';

const app: FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression
> = Fastify({ logger: true });

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

// Map to store MCP transports by session ID
const mcpTransports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// MCP tools definition
const mcpTools: Tool[] = [
  {
    name: 'lookup_airport',
    description:
      'Look up airport information by IATA code (3-letter code like LHR, JFK, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The IATA airport code or partial code to search for',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_airline',
    description:
      'Look up airline information by IATA code (2-letter code like BA, AA, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The IATA airline code or partial code to search for',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_aircraft',
    description:
      'Look up aircraft information by IATA code (3-letter code like 777, A320, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The IATA aircraft code or partial code to search for',
        },
      },
      required: ['query'],
    },
  },
];

// Create MCP server function
function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'iata-code-decoder',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: mcpTools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments');
    }

    const query = args.query as string;
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    try {
      switch (name) {
        case 'lookup_airport': {
          const airports = filterObjectsByPartialIataCode(
            getAirportsCache().prefixMap,
            query,
            3,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    query,
                    results: airports,
                    count: airports.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case 'lookup_airline': {
          const airlines = filterObjectsByPartialIataCode(
            getAirlinesCache().prefixMap,
            query,
            2,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    query,
                    results: airlines,
                    count: airlines.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case 'lookup_aircraft': {
          const aircraft = filterObjectsByPartialIataCode(
            getAircraftCache().prefixMap,
            query,
            3,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    query,
                    results: aircraft,
                    count: aircraft.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new Error(
        `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  });

  return server;
}

// Register CORS plugin to allow requests from any origin
await app.register(fastifyCors, { origin: '*' });

// Register compression plugin
await app.register(fastifyCompress);

/**
 * Creates a Map where keys are all possible non-empty lowercase prefixes of the
 * IATA codes in the provided dataset. This enables O(1) access to the candidate
 * list for a given prefix (overall query cost is still O(k) for k results).
 */
const createPrefixMap = (
  objects: ObjectWithIataCode[],
): Map<string, ObjectWithIataCode[]> => {
  const map = new Map<string, ObjectWithIataCode[]>();

  for (const object of objects) {
    const code = object.iataCode.toLowerCase();
    for (let i = 1; i <= code.length; i++) {
      const prefix = code.slice(0, i);
      let existing = map.get(prefix);
      if (!existing) {
        existing = [];
        map.set(prefix, existing);
      }
      existing.push(object);
    }
  }

  return map;
};

/**
 * Pre-built, immutable cache for a dataset. Holds:
 *   - the prefix map for O(1) candidate lookup by lowercase prefix,
 *   - a pre-serialized JSON `{"data":[...]}` body for every known prefix, and
 *   - a pre-serialized JSON `{"data":[...]}` body for the unfiltered list.
 *
 * Pre-serialization eliminates per-request JSON.stringify and Fastify schema
 * serialization for these read-only endpoints, which is the dominant cost when
 * returning thousands of records.
 */
interface DatasetCache {
  prefixMap: Map<string, ObjectWithIataCode[]>;
  serializedByPrefix: Map<string, string>;
  serializedAll: string;
}

const EMPTY_DATA_RESPONSE = '{"data":[]}';

const buildDatasetCache = (objects: ObjectWithIataCode[]): DatasetCache => {
  const prefixMap = createPrefixMap(objects);
  const serializedByPrefix = new Map<string, string>();
  for (const [prefix, bucket] of prefixMap) {
    serializedByPrefix.set(prefix, JSON.stringify({ data: bucket }));
  }
  return {
    prefixMap,
    serializedByPrefix,
    serializedAll: JSON.stringify({ data: objects }),
  };
};

/**
 * Lazily creates and memoizes a dataset cache so the underlying loader,
 * indexing, and serialization work only happen on first use.
 */
const createDatasetCacheGetter = (
  loader: () => ObjectWithIataCode[],
): (() => DatasetCache) => {
  let cache: DatasetCache | undefined;

  return (): DatasetCache => {
    if (!cache) {
      cache = buildDatasetCache(loader());
    }
    return cache;
  };
};

// Lazily initialize dataset caches on first use
const getAirportsCache = createDatasetCacheGetter(getAirports);
const getAirlinesCache = createDatasetCacheGetter(getAirlines);
const getAircraftCache = createDatasetCacheGetter(getAircraft);

/**
 * Eagerly populate every dataset cache. Call this from your startup code
 * (after `listen` resolves) to make the first user-facing request fast without
 * delaying server readiness.
 */
export const warmDatasetCaches = (): void => {
  getAirportsCache();
  getAirlinesCache();
  getAircraftCache();
};

/**
 * Filters objects by partial IATA code using a pre-calculated prefix map,
 * providing O(1) access to the matching candidate list.
 */
const filterObjectsByPartialIataCode = (
  prefixMap: Map<string, ObjectWithIataCode[]>,
  partialIataCode: string,
  iataCodeLength: number,
): ObjectWithIataCode[] => {
  const normalizedQuery = partialIataCode.toLowerCase();
  if (normalizedQuery.length > iataCodeLength) {
    return [];
  }

  return prefixMap.get(normalizedQuery) || [];
};

/**
 * Returns a pre-serialized JSON body for a query against a dataset cache.
 * Returns an empty `{"data":[]}` response when the query is longer than the
 * IATA code length or when no candidates match the prefix.
 */
const serializedResponseForQuery = (
  cache: DatasetCache,
  partialIataCode: string,
  iataCodeLength: number,
): string => {
  const normalizedQuery = partialIataCode.toLowerCase();
  if (normalizedQuery.length > iataCodeLength) {
    return EMPTY_DATA_RESPONSE;
  }

  return cache.serializedByPrefix.get(normalizedQuery) ?? EMPTY_DATA_RESPONSE;
};

// Query parameter interface
interface QueryParams {
  query?: string;
}

// Health endpoint schema
const healthSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  },
};

// Root endpoint schema
const rootSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        documentation_url: { type: 'string' },
      },
    },
  },
};

// Note: The data endpoints below send pre-serialized JSON strings directly
// (skipping per-request JSON.stringify and Fastify response serialization), so
// no `response` schema is attached to them.

// Query schema
const queryStringSchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
};

app.get(
  '/',
  {
    schema: rootSchema,
  },
  async () => {
    return {
      documentation_url: 'https://github.com/timrogers/iata-code-decoder-api',
    };
  },
);

app.get(
  '/health',
  {
    schema: healthSchema,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    return { success: true };
  },
);

app.get<{ Querystring: QueryParams }>(
  '/airports',
  {
    schema: {
      querystring: queryStringSchema,
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    const cache = getAirportsCache();
    if (request.query.query === undefined || request.query.query === '') {
      return reply.send(cache.serializedAll);
    }
    return reply.send(serializedResponseForQuery(cache, request.query.query, 3));
  },
);

app.get<{ Querystring: QueryParams }>(
  '/airlines',
  {
    schema: {
      querystring: queryStringSchema,
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    const cache = getAirlinesCache();
    if (request.query.query === undefined || request.query.query === '') {
      return reply.send(cache.serializedAll);
    }
    return reply.send(serializedResponseForQuery(cache, request.query.query, 2));
  },
);

app.get<{ Querystring: QueryParams }>(
  '/aircraft',
  {
    schema: {
      querystring: queryStringSchema,
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    const cache = getAircraftCache();
    if (request.query.query === undefined || request.query.query === '') {
      return reply.send(cache.serializedAll);
    }
    return reply.send(serializedResponseForQuery(cache, request.query.query, 3));
  },
);

// MCP over HTTP endpoints
// Interface for raw request/response access needed by MCP SDK
interface McpRequest {
  Headers: { 'mcp-session-id'?: string };
  Body: unknown;
}

app.post<McpRequest>(
  '/mcp',
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    try {
      // Check for existing session ID
      const sessionId = request.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && mcpTransports[sessionId]) {
        // Reuse existing transport
        transport = mcpTransports[sessionId];
      } else if (!sessionId && isInitializeRequest(request.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            mcpTransports[sessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete mcpTransports[transport.sessionId];
          }
        };

        const server = createMcpServer();
        // Connect to the MCP server
        await server.connect(transport);
      } else {
        // Invalid request
        reply.code(400);
        return {
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        };
      }

      // Handle the request using raw Node.js request/response
      // We need to send the reply manually and return undefined to tell Fastify we handled the response
      await transport.handleRequest(
        request.raw as IncomingMessage,
        reply.raw as ServerResponse,
        request.body,
      );
      // Tell Fastify we already sent the response
      reply.hijack();
    } catch (error) {
      request.log.error(error, 'Error handling MCP request');
      if (!reply.sent) {
        reply.code(500);
        return {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        };
      }
    }
  },
);

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (
  request: FastifyRequest<McpRequest>,
  reply: FastifyReply,
) => {
  const sessionId = request.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !mcpTransports[sessionId]) {
    reply.code(400);
    reply.type('text/plain');
    return 'Invalid or missing session ID';
  }

  const transport = mcpTransports[sessionId];
  await transport.handleRequest(
    request.raw as IncomingMessage,
    reply.raw as ServerResponse,
  );
  // Tell Fastify we already sent the response
  reply.hijack();
};

// Handle GET requests for server-to-client notifications via SSE
app.get<McpRequest>(
  '/mcp',
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    return handleSessionRequest(request, reply);
  },
);

// Handle DELETE requests for session termination
app.delete<McpRequest>(
  '/mcp',
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    return handleSessionRequest(request, reply);
  },
);

export default app;
