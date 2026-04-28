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
          const airports = filterObjectsByPartialIataCode(getAirportsMap(), query, 3);
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
          const airlines = filterObjectsByPartialIataCode(getAirlinesMap(), query, 2);
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
          const aircraft = filterObjectsByPartialIataCode(getAircraftMap(), query, 3);
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
 * Lazily creates and memoizes a prefix map for a dataset so the underlying
 * loader and indexing work only happen on first use.
 */
const createPrefixMapGetter = (
  loader: () => ObjectWithIataCode[],
): (() => Map<string, ObjectWithIataCode[]>) => {
  let prefixMap: Map<string, ObjectWithIataCode[]> | undefined;

  return (): Map<string, ObjectWithIataCode[]> => {
    if (!prefixMap) {
      prefixMap = createPrefixMap(loader());
    }
    return prefixMap;
  };
};

// Lazily initialize prefix maps on first use
const getAirportsMap = createPrefixMapGetter(getAirports);
const getAirlinesMap = createPrefixMapGetter(getAirlines);
const getAircraftMap = createPrefixMapGetter(getAircraft);

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

// Detailed response schemas for Airport, Airline, and Aircraft.
// By providing 'required' property lists and setting 'additionalProperties: false',
// we enable Fastify to use 'fast-json-stringify' for highly optimized JSON serialization,
// which significantly improves throughput for data-heavy responses.
const airportSchema = {
  type: 'object',
  required: [
    'id',
    'iataCode',
    'icaoCode',
    'name',
    'latitude',
    'longitude',
    'time_zone',
    'iataCountryCode',
    'cityName',
    'city',
  ],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    iataCode: { type: 'string' },
    icaoCode: { type: ['string', 'null'] },
    name: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    time_zone: { type: 'string' },
    timeZone: { type: 'string' },
    iataCountryCode: { type: 'string' },
    cityName: { type: 'string' },
    city: {
      type: ['object', 'null'],
      required: ['id', 'iataCode', 'iataCountryCode', 'name'],
      additionalProperties: false,
      properties: {
        id: { type: 'string' },
        iataCode: { type: 'string' },
        iataCountryCode: { type: 'string' },
        name: { type: 'string' },
      },
    },
  },
};

const airlineSchema = {
  type: 'object',
  required: ['id', 'iataCode', 'name'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    iataCode: { type: 'string' },
    name: { type: 'string' },
  },
};

const aircraftSchema = {
  type: 'object',
  required: ['id', 'iataCode', 'name'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    iataCode: { type: 'string' },
    name: { type: 'string' },
  },
};

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
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: airportSchema,
            },
          },
        },
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      return { data: getAirports() };
    } else {
      const query = request.query.query;
      const airports = filterObjectsByPartialIataCode(getAirportsMap(), query, 3);
      return { data: airports };
    }
  },
);

app.get<{ Querystring: QueryParams }>(
  '/airlines',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: airlineSchema,
            },
          },
        },
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      return { data: getAirlines() };
    } else {
      const query = request.query.query;
      const airlines = filterObjectsByPartialIataCode(getAirlinesMap(), query, 2);

      return {
        data: airlines,
      };
    }
  },
);

app.get<{ Querystring: QueryParams }>(
  '/aircraft',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: aircraftSchema,
            },
          },
        },
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      return { data: getAircraft() };
    } else {
      const query = request.query.query;
      const aircraft = filterObjectsByPartialIataCode(getAircraftMap(), query, 3);
      return { data: aircraft };
    }
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
