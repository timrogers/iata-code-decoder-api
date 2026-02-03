# API Rate Limiting Implementation Plan

## Executive Summary

This document outlines a comprehensive plan for implementing rate limiting in the IATA Code Decoder API. The goal is to protect the API from abuse, ensure fair usage, and maintain service reliability for all users.

## Current State Analysis

### Existing Infrastructure
- **Framework**: Fastify v5.6.2
- **Rate Limiting Library**: `@fastify/rate-limit` v10.3.0 (already installed but not configured)
- **Endpoints**:
  - REST API: `/health`, `/airports`, `/airlines`, `/aircraft`
  - MCP Server: `/mcp` (POST, GET, DELETE)
- **Current Protection**: None - no rate limiting is currently implemented
- **Caching**: 1-day cache headers on REST endpoints (except /health)

### Architecture Considerations
- API serves both human users (via REST) and AI systems (via MCP)
- Data is read-only and cached (no write operations)
- No authentication/authorization system currently in place
- Uses IP-based identification (default for @fastify/rate-limit)

## Rate Limiting Strategy

### 1. Multi-Tier Approach

#### Tier 1: Global Rate Limit (Baseline Protection)
**Purpose**: Prevent server overload and basic abuse
- **Scope**: All endpoints
- **Limit**: 1000 requests per 15 minutes per IP
- **Rationale**: Generous limit that accommodates legitimate usage while preventing basic DoS attacks

#### Tier 2: Endpoint-Specific Limits

**REST Endpoints** (`/airports`, `/airlines`, `/aircraft`):
- **Limit**: 100 requests per minute per IP
- **Rationale**: 
  - These are query endpoints that could be expensive
  - 100 req/min = ~1.67 req/sec, reasonable for most use cases
  - Cached responses reduce actual load

**Health Check** (`/health`):
- **Limit**: 60 requests per minute per IP
- **Rationale**:
  - Monitoring systems typically check every 30-60 seconds
  - Should not be too restrictive to avoid false alerts
  - Less critical to protect heavily as it's lightweight

**MCP Endpoints** (`/mcp`):
- **Limit**: 200 requests per minute per IP (POST/GET/DELETE combined)
- **Rationale**:
  - AI systems may make multiple rapid requests during conversations
  - Session-based usage patterns require more flexibility
  - Higher limit accommodates tool chains and multi-step operations

### 2. Rate Limit Configuration Options

#### Storage Backend
**Recommended**: Local in-memory store (default)
- **Pros**: Zero dependencies, fast, simple
- **Cons**: Resets on restart, not shared across instances
- **Best for**: Single-instance deployments, development

**Alternative**: Redis store (for future scaling)
- **Pros**: Persistent, shared across instances, production-ready
- **Cons**: Additional infrastructure dependency
- **Best for**: Multi-instance deployments, high-availability setups

#### Skip Conditions
Consider implementing allowlists for:
1. Localhost/development environments
2. Known monitoring services (configurable via environment variables)
3. Trusted internal IP ranges (if applicable)

### 3. Error Response Design

#### Standard 429 Response Format
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in X seconds.",
  "retryAfter": 60
}
```

#### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets
- `Retry-After`: Seconds until client can retry

## Implementation Recommendations

### Phase 1: Basic Implementation (Minimal Viable Product)

#### Step 1: Global Rate Limiting
```typescript
// In src/api.ts, after compression registration
import rateLimitPlugin from '@fastify/rate-limit';

await app.register(rateLimitPlugin, {
  global: true,
  max: 1000,
  timeWindow: '15 minutes',
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
    retryAfter: Math.ceil(context.ttl / 1000),
  }),
});
```

#### Step 2: Endpoint-Specific Overrides
```typescript
// For REST endpoints
const restApiRateLimit = {
  config: {
    rateLimit: {
      max: 100,
      timeWindow: '1 minute',
    },
  },
};

// Apply to routes
app.get('/airports', restApiRateLimit, async (request, reply) => {
  // ... existing handler
});

// For health endpoint
const healthRateLimit = {
  config: {
    rateLimit: {
      max: 60,
      timeWindow: '1 minute',
    },
  },
};

app.get('/health', healthRateLimit, async (request, reply) => {
  // ... existing handler
});

// For MCP endpoints
const mcpRateLimit = {
  config: {
    rateLimit: {
      max: 200,
      timeWindow: '1 minute',
    },
  },
};

app.post('/mcp', mcpRateLimit, async (request, reply) => {
  // ... existing handler
});
```

#### Step 3: Skip Development Environment
```typescript
await app.register(rateLimitPlugin, {
  global: true,
  max: 1000,
  timeWindow: '15 minutes',
  skip: (request) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
  // ... other options
});
```

### Phase 2: Enhanced Features (Optional)

#### Dynamic Rate Limits via Environment Variables
```typescript
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
```

#### IP Allowlist Support
```typescript
const allowedIPs = (process.env.RATE_LIMIT_ALLOWLIST || '').split(',').filter(Boolean);

skip: (request) => {
  const clientIp = request.ip;
  return process.env.NODE_ENV === 'development' || allowedIPs.includes(clientIp);
},
```

#### Custom Key Generator (for proxy/load balancer scenarios)
```typescript
keyGenerator: (request) => {
  // Check for X-Forwarded-For header (common with proxies)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip;
},
```

#### Ban Support (extreme cases)
```typescript
ban: parseInt(process.env.RATE_LIMIT_BAN_COUNT || '0', 10), // 0 = disabled by default
// If non-zero, temporarily ban IPs that exceed limit X times
```

### Phase 3: Monitoring & Observability

#### Metrics to Track
1. **Rate limit hits**: Count of 429 responses per endpoint
2. **Near-limit warnings**: Requests at >80% of limit
3. **Banned IPs**: If ban feature is enabled
4. **Top consumers**: IPs with highest request counts

#### Logging Strategy
```typescript
app.addHook('onResponse', (request, reply, done) => {
  if (reply.statusCode === 429) {
    request.log.warn({
      ip: request.ip,
      endpoint: request.url,
      method: request.method,
      remaining: reply.getHeader('x-ratelimit-remaining'),
    }, 'Rate limit exceeded');
  }
  done();
});
```

#### Health Check Integration
Consider adding rate limit status to `/health` endpoint:
```json
{
  "success": true,
  "rateLimit": {
    "enabled": true,
    "stores": ["memory"],
    "endpoints": {
      "rest": "100/minute",
      "mcp": "200/minute",
      "global": "1000/15min"
    }
  }
}
```

## Testing Strategy

### Unit Tests
1. **Rate limit plugin registration**: Verify plugin loads correctly
2. **Configuration parsing**: Test environment variable handling
3. **Skip logic**: Verify development mode and allowlist bypass

### Integration Tests (extend existing `__tests__/api.integration.test.ts`)

#### Test Suite 1: Global Rate Limiting
```typescript
describe('Rate Limiting - Global', () => {
  it('should allow requests under global limit', async () => {
    // Make multiple requests, verify all succeed
  });

  it('should return 429 when global limit exceeded', async () => {
    // Make requests exceeding global limit
    // Verify 429 response with correct headers
  });

  it('should include rate limit headers in responses', async () => {
    // Verify X-RateLimit-* headers present
  });
});
```

#### Test Suite 2: Endpoint-Specific Limits
```typescript
describe('Rate Limiting - REST Endpoints', () => {
  it('should enforce 100/min limit on /airports', async () => {
    // Make 101 requests to /airports
    // Verify 101st returns 429
  });

  it('should have independent counters per endpoint', async () => {
    // Max out /airports, verify /airlines still works
  });
});

describe('Rate Limiting - MCP Endpoints', () => {
  it('should enforce 200/min limit on /mcp', async () => {
    // Test MCP-specific limits
  });
});
```

#### Test Suite 3: Headers and Error Responses
```typescript
describe('Rate Limiting - Response Format', () => {
  it('should return proper 429 error structure', async () => {
    // Verify error message format
  });

  it('should include Retry-After header', async () => {
    // Verify Retry-After header present and accurate
  });
});
```

#### Test Suite 4: Skip Conditions
```typescript
describe('Rate Limiting - Skip Conditions', () => {
  it('should skip rate limiting in development mode', async () => {
    // Set NODE_ENV=development, verify no limits
  });

  it('should skip rate limiting for allowlisted IPs', async () => {
    // Test allowlist functionality
  });
});
```

### Load Testing
Use `autocannon` (already in devDependencies) to verify rate limiting under load:
```bash
# Test sustained load
autocannon -c 10 -d 60 http://localhost:4000/airports?query=LHR

# Test burst traffic
autocannon -c 50 -d 10 http://localhost:4000/health

# Verify 429 responses are properly returned
autocannon -c 200 -d 5 http://localhost:4000/airlines?query=BA
```

## Configuration Management

### Environment Variables (.env.example)
```bash
# Rate Limiting Configuration
NODE_ENV=production

# Global rate limit (all endpoints)
GLOBAL_RATE_LIMIT_MAX=1000
GLOBAL_RATE_LIMIT_WINDOW=15 minutes

# REST endpoints (/airports, /airlines, /aircraft)
REST_RATE_LIMIT_MAX=100
REST_RATE_LIMIT_WINDOW=1 minute

# MCP endpoints (/mcp)
MCP_RATE_LIMIT_MAX=200
MCP_RATE_LIMIT_WINDOW=1 minute

# Health endpoint (/health)
HEALTH_RATE_LIMIT_MAX=60
HEALTH_RATE_LIMIT_WINDOW=1 minute

# IP Allowlist (comma-separated, optional)
# RATE_LIMIT_ALLOWLIST=192.168.1.100,10.0.0.50

# Ban threshold (0 = disabled, >0 = ban after X limit violations)
# RATE_LIMIT_BAN_COUNT=0
```

### Docker Considerations
1. Rate limits are per-container (with in-memory store)
2. For multi-container deployments, consider Redis store
3. Ensure proper environment variable passing in Dockerfile/docker-compose

### Kubernetes/Cloud Deployment
1. Consider using shared Redis for rate limit store
2. Configure allowlist for load balancer/ingress IPs
3. Use `X-Forwarded-For` header for client IP detection
4. Monitor rate limit metrics via application logs

## Documentation Updates

### README.md Updates
Add new section: "Rate Limiting"
```markdown
## Rate Limiting

This API implements rate limiting to ensure fair usage and prevent abuse.

### Limits
- **Global**: 1000 requests per 15 minutes per IP
- **REST Endpoints** (`/airports`, `/airlines`, `/aircraft`): 100 requests per minute
- **MCP Endpoints** (`/mcp`): 200 requests per minute
- **Health Check** (`/health`): 60 requests per minute

### Rate Limit Headers
All responses include rate limit information:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Rate Limit Exceeded
When limits are exceeded, the API returns HTTP 429 with:
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

### Configuration
Rate limits can be customized via environment variables. See `.env.example` for details.
```

## Rollout Strategy

### Development Phase
1. Implement basic rate limiting on feature branch
2. Add comprehensive tests
3. Test locally with various scenarios
4. Run load tests with autocannon
5. Code review

### Staging/Testing Phase
1. Deploy to staging environment
2. Monitor logs for rate limit hits
3. Verify metrics collection
4. Test with realistic traffic patterns
5. Adjust limits based on observations

### Production Rollout
1. **Soft Launch**: Deploy with very high limits (10x normal)
   - Monitor for unexpected behavior
   - Collect baseline metrics
   - Verify no impact on legitimate users

2. **Progressive Tightening**: Gradually reduce limits over 1-2 weeks
   - Week 1: 5x normal limits
   - Week 2: 2x normal limits
   - Week 3: Normal limits

3. **Monitor & Adjust**:
   - Watch for 429 errors
   - Identify legitimate users hitting limits
   - Adjust based on real usage patterns

### Rollback Plan
- Rate limiting can be disabled via environment variable
- Quick rollback: Set all limits to very high values
- Full rollback: Deploy previous version without rate limiting

## Maintenance & Tuning

### Regular Reviews
- **Monthly**: Review rate limit metrics and adjust if needed
- **Quarterly**: Analyze usage patterns and optimize limits
- **After incidents**: Review and update strategy

### Key Metrics to Monitor
1. 429 response rate per endpoint
2. Average requests per IP
3. Peak traffic patterns
4. Cache hit rates (should remain high with rate limiting)

### Adjustment Triggers
- **Increase limits if**:
  - Many 429s from legitimate users
  - New use cases emerge requiring higher limits
  - API performance improves (better caching, faster responses)

- **Decrease limits if**:
  - Abuse patterns detected
  - Server resources under pressure
  - Quality of service degrading for all users

## Security Considerations

### Protection Provided
1. **DoS Prevention**: Limits malicious traffic volume
2. **Brute Force Protection**: Slows down scanning/discovery attacks
3. **Resource Conservation**: Prevents resource exhaustion
4. **Fair Usage**: Ensures equitable access for all users

### Limitations
1. **Distributed Attacks**: Single-instance rate limiting doesn't prevent distributed attacks
2. **Shared IPs**: Users behind NAT/proxies share rate limits
3. **Sophisticated Attacks**: Determined attackers can rotate IPs

### Additional Recommendations
1. Consider adding API key authentication for higher limits
2. Implement request validation and sanitization (already present)
3. Use helmet plugin (already installed) for security headers
4. Monitor for unusual patterns in logs
5. Consider CDN/WAF for DDoS protection at network level

## Cost-Benefit Analysis

### Benefits
- ✅ Protects against abuse and DoS attacks
- ✅ Ensures fair resource allocation
- ✅ Improves service reliability
- ✅ Low implementation overhead (library already installed)
- ✅ Minimal performance impact (in-memory store is fast)
- ✅ Industry best practice

### Costs
- ⚠️ Slight increase in response time (~1ms per request)
- ⚠️ Additional memory usage (typically <10MB for moderate traffic)
- ⚠️ Potential false positives for legitimate heavy users
- ⚠️ Requires monitoring and maintenance
- ⚠️ May need Redis for multi-instance deployments (additional infra)

### Overall Recommendation
**✅ STRONGLY RECOMMENDED** - The benefits far outweigh the costs, especially given that the library is already installed and requires minimal configuration.

## Implementation Checklist

### Pre-Implementation
- [x] Review current API architecture and endpoints
- [x] Confirm @fastify/rate-limit library is installed
- [x] Analyze current usage patterns (if metrics available)
- [ ] Define rate limit values based on requirements
- [ ] Document rate limiting strategy

### Implementation
- [ ] Configure global rate limiting
- [ ] Add endpoint-specific rate limit overrides
- [ ] Implement skip logic for development environment
- [ ] Configure environment variables
- [ ] Add custom error response builder
- [ ] Implement IP allowlist support (optional)
- [ ] Add rate limit status to health check (optional)

### Testing
- [ ] Write unit tests for configuration
- [ ] Add integration tests for rate limiting behavior
- [ ] Test with development skip condition
- [ ] Test allowlist functionality
- [ ] Run load tests with autocannon
- [ ] Verify rate limit headers in responses
- [ ] Test 429 error response format

### Documentation
- [ ] Update README.md with rate limiting section
- [ ] Update .env.example with rate limit variables
- [ ] Document configuration options
- [ ] Add troubleshooting guide
- [ ] Update API documentation (if exists)

### Deployment
- [ ] Deploy to staging environment
- [ ] Monitor staging for issues
- [ ] Collect baseline metrics
- [ ] Adjust limits based on staging data
- [ ] Deploy to production with high limits
- [ ] Gradually reduce to target limits
- [ ] Monitor and adjust as needed

### Post-Deployment
- [ ] Set up monitoring for 429 responses
- [ ] Review metrics weekly for first month
- [ ] Document any issues and resolutions
- [ ] Create runbook for rate limit incidents
- [ ] Schedule monthly review of rate limits

## Alternative Approaches Considered

### 1. No Rate Limiting
**Pros**: Simplest, no overhead
**Cons**: Vulnerable to abuse, no protection
**Decision**: ❌ Rejected - unacceptable security risk

### 2. API Key Authentication
**Pros**: Precise control, user accountability
**Cons**: Major architecture change, friction for users
**Decision**: ⏸️ Future consideration - rate limiting is prerequisite

### 3. Cloud WAF/CDN Rate Limiting
**Pros**: Offloads rate limiting, DDoS protection
**Cons**: Additional cost, vendor lock-in
**Decision**: ⏸️ Complementary - use both application and network layer

### 4. Custom Rate Limiting Implementation
**Pros**: Full control, customizable
**Cons**: More code to maintain, likely buggier
**Decision**: ❌ Rejected - @fastify/rate-limit is production-ready

## Conclusion

This plan provides a comprehensive roadmap for implementing rate limiting in the IATA Code Decoder API. The approach is pragmatic, balancing security and usability while leveraging existing infrastructure (@fastify/rate-limit library).

**Key Takeaways:**
1. Start with conservative limits and adjust based on real data
2. Implement in phases to minimize risk
3. Monitor continuously and be ready to adjust
4. Document thoroughly for users and maintainers

**Next Steps:**
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Write tests
4. Deploy to staging
5. Monitor and iterate

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-03  
**Author**: GitHub Copilot Task Agent  
**Status**: Pending Review
