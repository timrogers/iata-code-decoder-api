import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
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
const app = express();

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
      'Look up airport information by IATA code or search by name/location. Useful for finding airport details when users mention airport codes, city names, or need airport information for travel planning. Examples: "LHR" returns Heathrow, "JFK" returns John F. Kennedy, "Hea" returns airports starting with "Hea".',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The IATA airport code (e.g., "LHR", "JFK") or partial code/name to search for. Can be 1-3 characters.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_airline',
    description:
      'Look up airline information by IATA code or search by name. Useful for identifying airlines when users mention airline codes or names. Examples: "BA" returns British Airways, "AA" returns American Airlines, "United" finds United Airlines.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The IATA airline code (e.g., "BA", "AA") or partial code/name to search for. Can be 1-2 characters for codes.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_aircraft',
    description:
      'Look up aircraft information by IATA code or search by name/model. Useful for identifying aircraft types when users mention plane models or codes. Examples: "777" returns Boeing 777, "A320" returns Airbus A320, "Boeing" finds Boeing aircraft.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The IATA aircraft code (e.g., "777", "A320") or partial code/name to search for. Can be 1-3 characters for codes.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
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
      throw new Error('Invalid arguments provided');
    }

    const query = args.query as string;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query parameter is required and must be a non-empty string');
    }

    const limit = Math.min(Math.max(parseInt(args.limit as string) || 10, 1), 50);

    try {
      switch (name) {
        case 'lookup_airport': {
          const airports = searchObjects(AIRPORTS, query, 3, limit);

          if (airports.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No airports found for query "${query}". Try searching with:\n- 3-letter IATA codes (e.g., "LHR", "JFK")\n- Partial codes (e.g., "LH" for airports starting with LH)\n- Airport or city names (e.g., "Heathrow", "London")`,
                },
              ],
            };
          }

          const responseText = airports
            .map((airport) => {
              const cityInfo = airport.city
                ? ` in ${airport.cityName || airport.city.name}`
                : '';
              const countryInfo = airport.iataCountryCode
                ? ` (${airport.iataCountryCode})`
                : '';
              return `• ${airport.name}${cityInfo}${countryInfo} - IATA: ${airport.iataCode}${airport.icaoCode ? `, ICAO: ${airport.icaoCode}` : ''}${airport.timeZone ? `, Timezone: ${airport.timeZone}` : ''}`;
            })
            .join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${airports.length} airport${airports.length === 1 ? '' : 's'} for "${query}":\n\n${responseText}`,
              },
            ],
          };
        }

        case 'lookup_airline': {
          const airlines = searchObjects(AIRLINES, query, 2, limit);

          if (airlines.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No airlines found for query "${query}". Try searching with:\n- 2-letter IATA codes (e.g., "BA", "AA")\n- Partial codes (e.g., "B" for airlines starting with B)\n- Airline names (e.g., "British", "American")`,
                },
              ],
            };
          }

          const responseText = airlines
            .map((airline) => `• ${airline.name} - IATA: ${airline.iataCode}`)
            .join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${airlines.length} airline${airlines.length === 1 ? '' : 's'} for "${query}":\n\n${responseText}`,
              },
            ],
          };
        }

        case 'lookup_aircraft': {
          const aircraft = searchObjects(AIRCRAFT, query, 3, limit);

          if (aircraft.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No aircraft found for query "${query}". Try searching with:\n- 3-letter IATA codes (e.g., "777", "A320")\n- Partial codes (e.g., "77" for aircraft starting with 77)\n- Aircraft names (e.g., "Boeing", "Airbus")`,
                },
              ],
            };
          }

          const responseText = aircraft
            .map((plane) => `• ${plane.name} - IATA: ${plane.iataCode}`)
            .join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${aircraft.length} aircraft ${aircraft.length === 1 ? 'type' : 'types'} for "${query}":\n\n${responseText}`,
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

app.use(compression());
app.use(morgan('tiny'));
app.use(express.json());

// Enhanced search function that supports both IATA code and name-based search
const searchObjects = (
  objects: Keyable[],
  query: string,
  iataCodeLength: number,
  limit: number = 10,
): Keyable[] => {
  const queryLower = query.toLowerCase().trim();

  // If query length matches IATA code length or is shorter, prioritize IATA code search
  const iataMatches: Keyable[] = [];
  const nameMatches: Keyable[] = [];

  for (const object of objects) {
    // Exact IATA code match (highest priority)
    if (object.iataCode.toLowerCase() === queryLower) {
      iataMatches.unshift(object);
      continue;
    }

    // IATA code prefix match
    if (
      queryLower.length <= iataCodeLength &&
      object.iataCode.toLowerCase().startsWith(queryLower)
    ) {
      iataMatches.push(object);
      continue;
    }

    // Name-based search for longer queries or when IATA search doesn't fit
    if (queryLower.length > 1) {
      const nameToSearch = object.name?.toLowerCase() || '';
      const cityNameToSearch = object.cityName?.toLowerCase() || '';

      if (nameToSearch.includes(queryLower) || cityNameToSearch.includes(queryLower)) {
        nameMatches.push(object);
      }
    }
  }

  // Combine results with IATA matches first, then name matches
  const allResults = [...iataMatches, ...nameMatches];

  // Remove duplicates and limit results
  const uniqueResults = allResults.filter(
    (item, index, arr) => arr.findIndex((other) => other.id === item.id) === index,
  );

  return uniqueResults.slice(0, Math.min(limit, 50));
};

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.status(200).json({ success: true });
});

app.get('/airports', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const airports = searchObjects(AIRPORTS, query, 3, limit);
    res.json({
      data: airports,
      meta: {
        query,
        count: airports.length,
        limit,
      },
    });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const airlines = searchObjects(AIRLINES, query, 2, limit);

    res.json({
      data: airlines,
      meta: {
        query,
        count: airlines.length,
        limit,
      },
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const aircraft = searchObjects(AIRCRAFT, query, 3, limit);
    res.json({
      data: aircraft,
      meta: {
        query,
        count: aircraft.length,
        limit,
      },
    });
  }
});

// MCP over HTTP endpoints
app.post('/mcp', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && mcpTransports[sessionId]) {
      // Reuse existing transport
      transport = mcpTransports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
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
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !mcpTransports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = mcpTransports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

export default app;
