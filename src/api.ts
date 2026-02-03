import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from 'fastify';
import fastifyCompress from '@fastify/compress';
import rateLimitPlugin from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable } from './types.js';
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

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
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
          const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
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
          const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);
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
          const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
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
      );
    }
  });

  return server;
}

// Register compression plugin
await app.register(fastifyCompress);

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  global: {
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX || '1000', 10),
    timeWindow: process.env.GLOBAL_RATE_LIMIT_WINDOW || '15 minutes',
  },
  rest: {
    max: parseInt(process.env.REST_RATE_LIMIT_MAX || '100', 10),
    timeWindow: process.env.REST_RATE_LIMIT_WINDOW || '1 minute',
  },
  mcp: {
    max: parseInt(process.env.MCP_RATE_LIMIT_MAX || '200', 10),
    timeWindow: process.env.MCP_RATE_LIMIT_WINDOW || '1 minute',
  },
  health: {
    max: parseInt(process.env.HEALTH_RATE_LIMIT_MAX || '60', 10),
    timeWindow: process.env.HEALTH_RATE_LIMIT_WINDOW || '1 minute',
  },
};

// Parse allowlist from environment
const allowedIPs = (process.env.RATE_LIMIT_ALLOWLIST || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

// Register global rate limiting
await app.register(rateLimitPlugin, {
  global: true,
  max: RATE_LIMIT_CONFIG.global.max,
  timeWindow: RATE_LIMIT_CONFIG.global.timeWindow,

  // Custom allowList to skip rate limiting for development and allowlisted IPs
  allowList: (request) => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    const clientIp = request.ip;
    return allowedIPs.includes(clientIp);
  },

  // Custom key generator to handle X-Forwarded-For header
  keyGenerator: (request) => {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    return request.ip;
  },

  // Custom error response
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
    retryAfter: Math.ceil(context.ttl / 1000),
  }),

  // Add rate limit info to logs
  onExceeding: (request, key) => {
    request.log.warn(
      {
        ip: key,
        endpoint: request.url,
        method: request.method,
      },
      'Client approaching rate limit',
    );
  },

  onExceeded: (request, key) => {
    request.log.error(
      {
        ip: key,
        endpoint: request.url,
        method: request.method,
      },
      'Rate limit exceeded',
    );
  },
});

const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
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

// Data response schema
const dataResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array' },
  },
};

// Error response schema
const errorResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

// Query schema
const queryStringSchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
};

// Rate limit configurations for different endpoint types
const healthRateLimitConfig = {
  config: {
    rateLimit: {
      max: RATE_LIMIT_CONFIG.health.max,
      timeWindow: RATE_LIMIT_CONFIG.health.timeWindow,
    },
  },
};

const restApiRateLimitConfig = {
  config: {
    rateLimit: {
      max: RATE_LIMIT_CONFIG.rest.max,
      timeWindow: RATE_LIMIT_CONFIG.rest.timeWindow,
    },
  },
};

const mcpRateLimitConfig = {
  config: {
    rateLimit: {
      max: RATE_LIMIT_CONFIG.mcp.max,
      timeWindow: RATE_LIMIT_CONFIG.mcp.timeWindow,
    },
  },
};

app.get(
  '/health',
  {
    ...healthRateLimitConfig,
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
    ...restApiRateLimitConfig,
    schema: {
      querystring: queryStringSchema,
      response: {
        200: dataResponseSchema,
        400: errorResponseSchema,
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    } else {
      const query = request.query.query;
      const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
      return { data: airports };
    }
  },
);

app.get<{ Querystring: QueryParams }>(
  '/airlines',
  {
    ...restApiRateLimitConfig,
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
      return { data: AIRLINES };
    } else {
      const query = request.query.query;
      const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);

      return {
        data: airlines,
      };
    }
  },
);

app.get<{ Querystring: QueryParams }>(
  '/aircraft',
  {
    ...restApiRateLimitConfig,
    schema: {
      querystring: queryStringSchema,
      response: {
        200: dataResponseSchema,
        400: errorResponseSchema,
      },
    },
  },
  async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    } else {
      const query = request.query.query;
      const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
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
  mcpRateLimitConfig,
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
  mcpRateLimitConfig,
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    return handleSessionRequest(request, reply);
  },
);

// Handle DELETE requests for session termination
app.delete<McpRequest>(
  '/mcp',
  mcpRateLimitConfig,
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    return handleSessionRequest(request, reply);
  },
);

export default app;
