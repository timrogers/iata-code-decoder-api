# Express to Fastify Migration Patterns

## Core Route Conversions

### Basic GET Route
```javascript
// Express
app.get('/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  res.json(user);
});

// Fastify
fastify.get('/users/:id', async (request, reply) => {
  const user = await getUserById(request.params.id);
  return user; // Auto-serializes to JSON
});
```

### POST with Body
```javascript
// Express
app.post('/users', (req, res) => {
  const user = createUser(req.body);
  res.status(201).json(user);
});

// Fastify with schema validation
fastify.post('/users', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const user = await createUser(request.body);
  reply.code(201);
  return user;
});
```

## Middleware to Hooks Migration

### Global Middleware
```javascript
// Express
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// Fastify
fastify.addHook('onRequest', async (request, reply) => {
  request.requestTime = Date.now();
});
```

### Route-Specific Middleware
```javascript
// Express
const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
app.get('/protected', authenticate, (req, res) => {
  res.json({ data: 'secret' });
});

// Fastify
const authenticate = async (request, reply) => {
  if (!request.headers.authorization) {
    reply.code(401);
    throw new Error('Unauthorized');
  }
};
fastify.get('/protected', {
  preHandler: authenticate
}, async (request, reply) => {
  return { data: 'secret' };
});
```

### Multiple Middleware Chain
```javascript
// Express
app.post('/items', [authenticate, validate, rateLimit], handler);

// Fastify
fastify.post('/items', {
  preHandler: [authenticate, validate, rateLimit]
}, handler);
```

## Error Handling

### Express Error Handler
```javascript
// Express
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message
  });
});

// Fastify
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message
  });
});
```

### Custom Error Classes
```javascript
// Express
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

// Fastify (same class, but handle in error handler)
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof NotFoundError) {
    reply.status(404).send({ error: error.message });
  } else {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
});
```

## Request/Response Patterns

### Query Parameters
```javascript
// Express
app.get('/search', (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
});

// Fastify with validation
fastify.get('/search', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        q: { type: 'string' },
        limit: { type: 'integer', default: 10 },
        offset: { type: 'integer', default: 0 }
      },
      required: ['q']
    }
  }
}, async (request, reply) => {
  const { q, limit, offset } = request.query;
});
```

### Headers
```javascript
// Express
app.get('/data', (req, res) => {
  const apiKey = req.get('X-API-Key');
});

// Fastify
fastify.get('/data', {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'x-api-key': { type: 'string' }
      },
      required: ['x-api-key']
    }
  }
}, async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
});
```

### Cookies
```javascript
// Express (with cookie-parser)
app.get('/profile', (req, res) => {
  const sessionId = req.cookies.sessionId;
});

// Fastify (with @fastify/cookie)
await fastify.register(require('@fastify/cookie'));
fastify.get('/profile', async (request, reply) => {
  const sessionId = request.cookies.sessionId;
});
```

## Routing Patterns

### Router Groups
```javascript
// Express
const userRouter = express.Router();
userRouter.get('/', getUsers);
userRouter.post('/', createUser);
app.use('/users', userRouter);

// Fastify
async function userRoutes(fastify, options) {
  fastify.get('/', getUsers);
  fastify.post('/', createUser);
}
fastify.register(userRoutes, { prefix: '/users' });
```

### Route Prefixing
```javascript
// Express
const apiRouter = express.Router();
// ... routes
app.use('/api/v1', apiRouter);

// Fastify
fastify.register(apiRoutes, { prefix: '/api/v1' });
```

## Static Files

```javascript
// Express
app.use(express.static('public'));

// Fastify
await fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public')
});
```

## CORS

```javascript
// Express (with cors)
app.use(cors({
  origin: 'https://example.com',
  credentials: true
}));

// Fastify
await fastify.register(require('@fastify/cors'), {
  origin: 'https://example.com',
  credentials: true
});
```

## Body Parsing

```javascript
// Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fastify (built-in, no registration needed)
// JSON parsing is automatic
// For multipart/form-data:
await fastify.register(require('@fastify/multipart'));
```

## Session Management

```javascript
// Express (with express-session)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// Fastify
await fastify.register(require('@fastify/session'), {
  secret: 'keyboard cat',
  cookie: { secure: false }
});
```

## Rate Limiting

```javascript
// Express (with express-rate-limit)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Fastify
await fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '15 minutes'
});
```

## Async/Await Patterns

### Error Handling in Routes
```javascript
// Express (needs try-catch or wrapper)
app.get('/users', async (req, res, next) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Fastify (automatic error handling)
fastify.get('/users', async (request, reply) => {
  const users = await getUsers();
  return users;
  // Errors automatically caught and sent to error handler
});
```

## Decorators

### Adding Custom Properties
```javascript
// Express
app.locals.db = database;
// OR
req.db = database; // Per-request

// Fastify
fastify.decorate('db', database);
// Access via: fastify.db or request.server.db

fastify.decorateRequest('user', null);
// Set per-request: request.user = userData
```

## Lifecycle Hooks Order

Fastify hooks execute in this order:
1. `onRequest` - Called when request is received
2. `preParsing` - Before body parsing
3. `preValidation` - Before validation
4. `preHandler` - Before route handler (like Express middleware)
5. `preSerialization` - Before response serialization
6. `onSend` - Before response is sent
7. `onResponse` - After response is sent
8. `onTimeout` - If request times out
9. `onError` - If error occurs

## Schema Validation Benefits

Fastify's JSON Schema validation provides:
- Automatic request validation
- Type coercion (strings to numbers, etc.)
- 10-20% performance boost through fast serialization
- Auto-generated API documentation (with fastify-swagger)
- TypeScript type inference (with json-schema-to-ts)

## Testing Patterns

```javascript
// Express (with supertest)
const request = require('supertest');
request(app).get('/users').expect(200);

// Fastify (with fastify.inject)
const response = await fastify.inject({
  method: 'GET',
  url: '/users'
});
assert.equal(response.statusCode, 200);
```
