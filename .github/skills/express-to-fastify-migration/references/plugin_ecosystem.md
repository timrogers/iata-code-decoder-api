# Fastify Plugin Ecosystem

## Essential Plugins Mapping

### Body Parsing
- **Express**: `body-parser`, `express.json()`, `express.urlencoded()`
- **Fastify**: Built-in (no plugin needed for JSON)
- **Multipart**: `@fastify/multipart`

### CORS
- **Express**: `cors`
- **Fastify**: `@fastify/cors`

### Static Files
- **Express**: `express.static()`
- **Fastify**: `@fastify/static`

### Cookies
- **Express**: `cookie-parser`
- **Fastify**: `@fastify/cookie`

### Sessions
- **Express**: `express-session`
- **Fastify**: `@fastify/session`

### Rate Limiting
- **Express**: `express-rate-limit`
- **Fastify**: `@fastify/rate-limit`

### Compression
- **Express**: `compression`
- **Fastify**: `@fastify/compress`

### Helmet (Security)
- **Express**: `helmet`
- **Fastify**: `@fastify/helmet`

### JWT
- **Express**: `jsonwebtoken` + custom middleware
- **Fastify**: `@fastify/jwt`

### Swagger/OpenAPI
- **Express**: `swagger-ui-express` + manual config
- **Fastify**: `@fastify/swagger` + `@fastify/swagger-ui` (auto-generates from schemas)

### WebSockets
- **Express**: `ws` or `socket.io`
- **Fastify**: `@fastify/websocket`

### File Upload
- **Express**: `multer`
- **Fastify**: `@fastify/multipart`

### GraphQL
- **Express**: `express-graphql`
- **Fastify**: `mercurius`

### View Engines
- **Express**: `ejs`, `pug`, etc. (built-in support)
- **Fastify**: `@fastify/view` (supports all Express engines)

## Plugin Registration Patterns

```javascript
// Basic registration
await fastify.register(require('@fastify/cors'));

// With options
await fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

// With prefix (for routes)
await fastify.register(userRoutes, { prefix: '/users' });

// Encapsulation (scoped decorators/hooks)
await fastify.register(async function (fastify, options) {
  // This scope has its own decorators and hooks
  fastify.decorate('localOnly', true);
}, { prefix: '/admin' });
```

## Common Plugin Dependencies

When migrating, you'll typically need:

```bash
npm install fastify
npm install @fastify/cors
npm install @fastify/helmet
npm install @fastify/rate-limit
npm install @fastify/cookie
npm install @fastify/static
# Add others as needed
```

## Plugin Best Practices

1. **Always await** plugin registration in async context
2. **Register before routes** - plugins should be registered before defining routes
3. **Use encapsulation** - leverage Fastify's scope system for cleaner architecture
4. **Schema-first** - define schemas for all routes to get full performance benefits
5. **Type safety** - use TypeScript with fastify's type system
