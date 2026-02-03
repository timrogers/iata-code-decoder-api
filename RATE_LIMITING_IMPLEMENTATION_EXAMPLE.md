# Rate Limiting Implementation Example

This document provides code snippets and examples for implementing the rate limiting plan outlined in `RATE_LIMITING_PLAN.md`.

## Quick Start Implementation

### Step 1: Import and Configure Rate Limiting Plugin

Add to `src/api.ts` after the compression plugin registration (around line 198):

```typescript
import rateLimitPlugin from '@fastify/rate-limit';

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
  .map(ip => ip.trim())
  .filter(Boolean);

// Register global rate limiting
await app.register(rateLimitPlugin, {
  global: true,
  max: RATE_LIMIT_CONFIG.global.max,
  timeWindow: RATE_LIMIT_CONFIG.global.timeWindow,
  
  // Skip rate limiting for development and allowlisted IPs
  skip: (request) => {
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
    request.log.warn({
      ip: key,
      endpoint: request.url,
      method: request.method,
    }, 'Client approaching rate limit');
  },
  
  onExceeded: (request, key) => {
    request.log.error({
      ip: key,
      endpoint: request.url,
      method: request.method,
    }, 'Rate limit exceeded');
  },
});
```

### Step 2: Add Endpoint-Specific Rate Limit Configurations

Before the route definitions, add:

```typescript
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
```

### Step 3: Apply Rate Limits to Endpoints

Update each endpoint definition to include the rate limit config as the second parameter:

#### Health Endpoint
```typescript
app.get(
  '/health',
  {
    ...healthRateLimitConfig,
    schema: healthSchema,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    // ... existing handler code
  },
);
```

#### REST API Endpoints (airports, airlines, aircraft)
```typescript
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
    // ... existing handler code
  },
);

// Similar changes for /airlines and /aircraft
```

#### MCP Endpoints
```typescript
app.post<McpRequest>(
  '/mcp',
  mcpRateLimitConfig,
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    // ... existing handler code
  },
);

app.get<McpRequest>(
  '/mcp',
  mcpRateLimitConfig,
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    // ... existing handler code
  },
);

app.delete<McpRequest>(
  '/mcp',
  mcpRateLimitConfig,
  async (request: FastifyRequest<McpRequest>, reply: FastifyReply) => {
    // ... existing handler code
  },
);
```

## Testing Examples

### Example Test: Verify Rate Limit Headers

Add to `__tests__/api.integration.test.ts`:

```typescript
describe('Rate Limiting', () => {
  describe('Rate Limit Headers', () => {
    it('should include rate limit headers in successful responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=LHR',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('Rate Limit Enforcement', () => {
    it('should return 429 when REST endpoint limit is exceeded', async () => {
      // Make 101 requests (assuming 100/min limit)
      const requests = Array.from({ length: 101 }, () =>
        app.inject({
          method: 'GET',
          url: '/airports?query=A',
        })
      );

      const responses = await Promise.all(requests);
      
      // First 100 should succeed
      const successCount = responses.filter(r => r.statusCode === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(100);
      
      // At least one should be rate limited
      const rateLimitedCount = responses.filter(r => r.statusCode === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should include proper error structure in 429 response', async () => {
      // Exhaust rate limit first
      await Promise.all(
        Array.from({ length: 110 }, () =>
          app.inject({
            method: 'GET',
            url: '/airports?query=B',
          })
        )
      );

      // Make one more request to get 429
      const response = await app.inject({
        method: 'GET',
        url: '/airports?query=B',
      });

      if (response.statusCode === 429) {
        const body = response.json();
        expect(body).toHaveProperty('statusCode', 429);
        expect(body).toHaveProperty('error', 'Too Many Requests');
        expect(body).toHaveProperty('message');
        expect(body.message).toContain('Rate limit exceeded');
        expect(body).toHaveProperty('retryAfter');
        expect(response.headers['retry-after']).toBeDefined();
      }
    });

    it('should have independent rate limits per endpoint', async () => {
      // Exhaust /airports limit
      await Promise.all(
        Array.from({ length: 110 }, () =>
          app.inject({
            method: 'GET',
            url: '/airports?query=C',
          })
        )
      );

      // /airlines should still work
      const response = await app.inject({
        method: 'GET',
        url: '/airlines?query=BA',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Skip Conditions', () => {
    it('should respect skip logic', async () => {
      // This test would need to set NODE_ENV or test with allowlisted IP
      // Implementation depends on testing strategy
    });
  });
});
```

## Load Testing Examples

### Test with Autocannon

```bash
# Test normal load (should succeed)
autocannon -c 10 -d 30 http://localhost:4000/airports?query=LHR

# Test rate limit threshold (should see 429s)
autocannon -c 50 -d 10 -m GET http://localhost:4000/airports?query=TEST

# Test health endpoint
autocannon -c 20 -d 30 http://localhost:4000/health

# Test with custom duration and connections
autocannon \
  --connections 100 \
  --duration 60 \
  --method GET \
  http://localhost:4000/airlines?query=BA
```

### Analyze Autocannon Results

Look for:
- Non-2xx responses (429s indicate rate limiting is working)
- Response time distribution
- Requests per second
- Error rate

Example output interpretation:
```
Stat         2.5%  50%   97.5%  99%   Avg     Stdev   Max
Latency (ms) 2     3     8      12    4.1     2.3     45

429 errors: 234/10000 (2.34%)  <- Rate limiting working as expected
```

## Monitoring Examples

### Log Analysis Queries

If using structured logging:

```bash
# Count rate limit violations by IP
jq 'select(.msg == "Rate limit exceeded") | .ip' logs.json | sort | uniq -c | sort -rn

# Rate limit violations by endpoint
jq 'select(.msg == "Rate limit exceeded") | .endpoint' logs.json | sort | uniq -c

# Time series of rate limit hits
jq -r 'select(.msg == "Rate limit exceeded") | .time' logs.json | cut -d'T' -f1 | uniq -c
```

### Metrics to Track

1. **Total 429 responses**: `sum(rate(http_requests_total{status="429"}[5m]))`
2. **429 rate per endpoint**: `rate(http_requests_total{status="429"}[5m]) by (endpoint)`
3. **Top rate-limited IPs**: Group by IP and count 429s
4. **Average requests per IP**: Total requests / unique IPs

## Troubleshooting

### Issue: Legitimate users getting rate limited

**Solution**: 
1. Check if IP is shared (NAT/proxy)
2. Add IP to allowlist
3. Consider increasing limits
4. Implement API key authentication for higher limits

### Issue: Rate limits not working

**Checklist**:
1. Verify plugin is registered: Check for `@fastify/rate-limit` in logs
2. Check NODE_ENV: Not set to 'development'?
3. Verify IP detection: Check `X-Forwarded-For` header handling
4. Test with curl: `curl -v http://localhost:4000/health`

### Issue: Rate limits reset unexpectedly

**Cause**: Server restart clears in-memory store

**Solutions**:
1. Use Redis store for persistence
2. Document this behavior for users
3. Consider longer time windows

### Issue: Different rate limits across instances

**Cause**: Each instance has its own in-memory store

**Solution**: Implement shared Redis store

```typescript
import { RedisStore } from '@fastify/rate-limit/stores/redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

await app.register(rateLimitPlugin, {
  // ... other config
  redis: redis,
  nameSpace: 'rate-limit:',
});
```

## Advanced: Redis Store Implementation

For production deployments with multiple instances:

### 1. Add Redis dependency
```bash
npm install ioredis
npm install -D @types/ioredis
```

### 2. Update configuration
```typescript
import Redis from 'ioredis';

let redis: Redis | undefined;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  });
  
  redis.on('error', (err) => {
    app.log.error({ err }, 'Redis connection error');
  });
}

await app.register(rateLimitPlugin, {
  global: true,
  max: RATE_LIMIT_CONFIG.global.max,
  timeWindow: RATE_LIMIT_CONFIG.global.timeWindow,
  redis: redis, // Use Redis if available, otherwise in-memory
  nameSpace: 'iata-api:rate-limit:',
  // ... rest of config
});
```

### 3. Update .env.example
```bash
# Redis URL for distributed rate limiting (optional)
# REDIS_URL=redis://localhost:6379
```

## Performance Considerations

### Memory Usage (In-Memory Store)
- ~100 bytes per unique IP
- 10,000 unique IPs ≈ 1 MB
- Automatically clears expired entries

### Response Time Impact
- In-memory: ~0.1-1ms per request
- Redis: ~2-5ms per request (network latency)

### Optimization Tips
1. Use in-memory store for single instance
2. Use Redis only for multi-instance deployments
3. Keep timeWindow reasonable (15 min or less)
4. Consider using `continueExceeding: false` to stop tracking after limit

## Security Best Practices

1. **Always use HTTPS in production**: Prevents IP spoofing
2. **Trust proxy configuration**: If behind load balancer/proxy
   ```typescript
   const app = Fastify({ 
     logger: true,
     trustProxy: true // or specific IP ranges
   });
   ```
3. **Monitor for distributed attacks**: Single-IP rate limiting won't stop all attacks
4. **Combine with other protections**: Helmet, CORS, input validation
5. **Regular limit reviews**: Adjust based on traffic patterns
6. **Implement ban feature carefully**: Can lock out legitimate users

## Checklist for Implementation

- [ ] Import @fastify/rate-limit plugin
- [ ] Add rate limit configuration with environment variables
- [ ] Implement skip logic for development and allowlist
- [ ] Add custom error response builder
- [ ] Register global rate limiting
- [ ] Add endpoint-specific rate limit configs
- [ ] Apply rate limits to all endpoints
- [ ] Add logging for rate limit events
- [ ] Write integration tests
- [ ] Run load tests with autocannon
- [ ] Update .env.example (already done)
- [ ] Update README.md with rate limiting docs
- [ ] Test in staging environment
- [ ] Deploy to production with monitoring

---

**Note**: This is an example implementation guide. Actual implementation should follow the comprehensive plan in `RATE_LIMITING_PLAN.md` and be adjusted based on specific requirements and testing results.
