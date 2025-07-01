import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { randomUUID } from 'node:crypto';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable } from './types.js';
import { createMcpServer } from './mcp-core.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

// Map to store MCP transports by session ID
const mcpTransports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.use(compression());
app.use(morgan('tiny'));
app.use(express.json());

const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable | undefined => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
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
    const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
    res.json({ data: airports });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);

    res.json({
      data: airlines,
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
    const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
    res.json({ data: aircraft });
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
