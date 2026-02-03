# API Rate Limiting Implementation Plan

## Executive Summary

This document outlines a comprehensive plan for implementing rate limiting in the IATA Code Decoder API. Rate limiting is essential for protecting the API from abuse, ensuring fair resource allocation, and maintaining service quality for all users.

## Current State Analysis

### Existing Infrastructure
- **Framework**: Fastify v5.6.2
- **Rate Limiting Package**: `@fastify/rate-limit` v10.3.0 (already installed)
- **Deployment**: Docker container on port 4000
- **Architecture**: Single-instance API with dual interface (REST + MCP)

### Current Endpoints
1. **REST Endpoints**:
   - `GET /health` - Health check endpoint (no-cache)
   - `GET /airports?query={code}` - Airport lookup (1-day cache)
   - `GET /airlines?query={code}` - Airline lookup (1-day cache)
   - `GET /aircraft?query={code}` - Aircraft lookup (1-day cache)

2. **MCP Endpoints**:
   - `POST /mcp` - MCP initialization and requests
   - `GET /mcp` - Server-to-client notifications via SSE
   - `DELETE /mcp` - Session termination

### Current Vulnerabilities
- No rate limiting currently implemented
- All endpoints are publicly accessible without throttling
- Potential for abuse through rapid repeated requests
- No protection against DDoS attacks
- Resource exhaustion possible

## Rate Limiting Strategy

### 1. Rate Limiting Tiers

#### Tier 1: Global Rate Limiting
**Purpose**: Protect the entire API from overwhelming traffic

**Configuration**:
- **Limit**: 1000 requests per 15 minutes per IP
- **Applies to**: All endpoints
- **Response**: HTTP 429 (Too Many Requests)
- **Reset Time**: 15 minutes rolling window

**Rationale**: Prevents single clients from monopolizing server resources while being generous enough for legitimate use cases.

#### Tier 2: Endpoint-Specific Rate Limiting

##### Health Endpoint (`/health`)
- **Limit**: 60 requests per minute per IP
- **Rationale**: Health checks are lightweight but should be limited to prevent abuse as uptime monitoring spam

##### Data Lookup Endpoints (`/airports`, `/airlines`, `/aircraft`)
- **Limit**: 100 requests per minute per IP
- **Rationale**: Balance between user experience and server protection. Most users won't need more than 100 lookups per minute.

##### MCP Endpoints (`/mcp`)
- **Limit**: 200 requests per 15 minutes per session ID
- **Rationale**: MCP sessions involve multiple requests for initialization, tools listing, and tool calls. More generous limit for stateful sessions.

#### Tier 3: Anonymous vs Authenticated Users (Future Enhancement)
- **Anonymous**: Standard limits (as above)
- **Authenticated**: 5x higher limits (to be implemented with API key system)

### 2. Rate Limiting Key Strategy

#### Primary Key: IP Address
- Use `X-Forwarded-For` header (first IP) when behind proxy
- Fallback to connection IP if header not present
- Handles basic use case for most deployments

#### Secondary Key: Session ID (for MCP)
- MCP endpoints track by `mcp-session-id` header
- Prevents session hijacking and abuse
- Separate limit pool from REST endpoints

### 3. Storage Backend Options

#### Option A: In-Memory (Recommended for MVP)
**Pros**:
- Simple implementation (default for `@fastify/rate-limit`)
- No external dependencies
- Fast performance
- Works out-of-the-box

**Cons**:
- Limits reset on server restart
- Not suitable for multi-instance deployments
- No persistence across deployments

**Use Case**: Single-instance deployments, development, and initial rollout

#### Option B: Redis (Recommended for Production)
**Pros**:
- Persistent storage across restarts
- Supports multi-instance deployments
- Atomic operations for accurate counting
- Can be shared across services

**Cons**:
- Requires Redis infrastructure
- Additional operational complexity
- Network latency for rate limit checks

**Use Case**: Production multi-instance deployments, high-availability setups

#### Option C: External API Gateway (e.g., Cloudflare, AWS API Gateway)
**Pros**:
- Managed solution
- DDoS protection included
- Geographically distributed
- Analytics and monitoring built-in

**Cons**:
- Additional cost
- Less control over rate limiting logic
- Vendor lock-in
- Requires architectural changes

**Use Case**: Large-scale production deployments with high traffic

### Recommendation: 
Start with **Option A (In-Memory)** for immediate implementation, with architecture designed to easily switch to **Option B (Redis)** as the deployment scales.

## Implementation Plan

### Phase 1: Basic Rate Limiting (Immediate)

#### Step 1.1: Configure @fastify/rate-limit Plugin
**File**: `src/api.ts`

**Changes**:
```typescript
import rateLimit from '@fastify/rate-limit';

// Global rate limit configuration
await app.register(rateLimit, {
  global: true,
  max: 1000,
  timeWindow: '15 minutes',
  ban: undefined, // No automatic ban
  cache: 10000, // Cache size
  allowList: [], // IPs to exclude from rate limiting
  redis: undefined, // Use in-memory for now
  skipOnError: true, // Don't fail requests if rate limit check errors
  addHeadersOnExceeding: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
    retryAfter: context.ttl,
  }),
});
```

**Testing**: 
- Verify rate limit headers are returned in responses
- Test rate limit enforcement by making rapid requests
- Confirm 429 response when limit exceeded

#### Step 1.2: Configure Endpoint-Specific Rate Limits

**Changes**:
```typescript
// Health endpoint - more restrictive
app.get('/health', {
  config: {
    rateLimit: {
      max: 60,
      timeWindow: '1 minute',
    },
  },
  schema: healthSchema,
}, async (request, reply) => {
  // existing handler code
});

// Data endpoints - moderate limits
const dataEndpointRateLimit = {
  max: 100,
  timeWindow: '1 minute',
};

app.get('/airports', {
  config: {
    rateLimit: dataEndpointRateLimit,
  },
  schema: { /* ... */ },
}, async (request, reply) => {
  // existing handler code
});

// Similarly for /airlines and /aircraft

// MCP endpoints - session-based limits
const mcpRateLimit = {
  max: 200,
  timeWindow: '15 minutes',
  keyGenerator: (request) => {
    // Use session ID for MCP endpoints
    return request.headers['mcp-session-id'] as string || request.ip;
  },
};

app.post('/mcp', {
  config: {
    rateLimit: mcpRateLimit,
  },
}, async (request, reply) => {
  // existing handler code
});
```

**Testing**:
- Test each endpoint independently
- Verify different endpoints have separate counters
- Confirm MCP session-based rate limiting works correctly

#### Step 1.3: Add Environment Configuration

**File**: `.env.example`

**Changes**:
```env
# Existing variables
DUFFEL_ACCESS_TOKEN=your_access_token_here

# Rate Limiting Configuration
RATE_LIMIT_GLOBAL_MAX=1000
RATE_LIMIT_GLOBAL_WINDOW=15m
RATE_LIMIT_HEALTH_MAX=60
RATE_LIMIT_HEALTH_WINDOW=1m
RATE_LIMIT_DATA_MAX=100
RATE_LIMIT_DATA_WINDOW=1m
RATE_LIMIT_MCP_MAX=200
RATE_LIMIT_MCP_WINDOW=15m

# Redis Configuration (optional, for future use)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
```

**File**: `src/api.ts`

**Changes**:
- Parse environment variables with fallback to defaults
- Use environment variables for rate limit configuration
- Document in README.md

### Phase 2: Monitoring and Observability (Short-term)

#### Step 2.1: Add Rate Limit Metrics

**Implementation**:
- Hook into `@fastify/rate-limit` events
- Track rate limit hits per endpoint
- Monitor 429 response rates
- Log rate limit violations (with IP for investigation)

**Logging Example**:
```typescript
app.addHook('onResponse', (request, reply, done) => {
  if (reply.statusCode === 429) {
    request.log.warn({
      ip: request.ip,
      url: request.url,
      userAgent: request.headers['user-agent'],
      remaining: reply.getHeader('x-ratelimit-remaining'),
    }, 'Rate limit exceeded');
  }
  done();
});
```

#### Step 2.2: Add Monitoring Dashboard Support

**Options**:
- Prometheus metrics export
- Datadog/New Relic APM integration
- CloudWatch custom metrics (if on AWS)

**Metrics to Track**:
- Total requests per endpoint
- Rate limit violations per endpoint
- Average rate limit consumption
- Top IP addresses by request volume
- 429 responses over time

### Phase 3: Redis Backend (Medium-term)

#### Step 3.1: Add Redis Configuration

**File**: `package.json`

**Changes**:
```json
"dependencies": {
  // ... existing dependencies
  "ioredis": "^5.3.0"
}
```

#### Step 3.2: Implement Redis Rate Limit Store

**File**: `src/rate-limit-store.ts` (new file)

**Implementation**:
- Redis connection management
- Graceful degradation if Redis unavailable
- Health check for Redis connection

**File**: `src/api.ts`

**Changes**:
```typescript
import Redis from 'ioredis';

let redis;
if (process.env.REDIS_HOST) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // Exponential backoff
      return Math.min(times * 50, 2000);
    },
  });
}

await app.register(rateLimit, {
  redis: redis, // Null falls back to in-memory
  // ... other config
});
```

#### Step 3.3: Docker Compose for Local Development

**File**: `docker-compose.yml` (new file)

**Implementation**:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Phase 4: Advanced Features (Long-term)

#### Step 4.1: API Key Authentication System

**Implementation**:
- Generate API keys for registered users
- Store API keys in database/Redis
- Authenticate requests via `X-API-Key` header
- Different rate limits for authenticated users
- API key management endpoints (create, revoke, list)

**Rate Limits**:
- Anonymous: Standard limits
- Authenticated Free Tier: 5x standard limits
- Authenticated Pro Tier: 50x standard limits

#### Step 4.2: Dynamic Rate Limiting

**Features**:
- Adjust limits based on server load
- Increase limits during low-traffic periods
- Decrease limits during high-traffic periods
- Circuit breaker pattern for overload protection

#### Step 4.3: Rate Limit Bypass for Special Cases

**Use Cases**:
- Internal monitoring systems
- Trusted partners
- Emergency access

**Implementation**:
- Allowlist by IP address or API key
- Separate high-priority queue
- Environment-based configuration

#### Step 4.4: Distributed Rate Limiting with Sticky Sessions

**For Multi-Instance Deployments**:
- Use Redis for shared state
- Implement sticky sessions for MCP endpoints
- Load balancer configuration
- Session affinity based on session ID

## Testing Strategy

### Unit Tests

**File**: `__tests__/rate-limit.unit.test.ts` (new file)

**Test Cases**:
- Rate limit configuration is correctly applied
- Rate limit headers are present in responses
- 429 error is returned when limit exceeded
- Different endpoints have independent counters
- MCP session-based rate limiting works
- Environment variables are correctly parsed
- Redis fallback works when Redis is unavailable

### Integration Tests

**File**: `__tests__/rate-limit.integration.test.ts` (new file)

**Test Cases**:
- Make 100 requests rapidly and verify enforcement
- Verify rate limit resets after time window
- Test concurrent requests from different IPs
- Test MCP session limits independently
- Verify cache headers are still set correctly
- Test rate limit doesn't interfere with existing functionality

### Load Tests

**Tool**: Autocannon (already in devDependencies)

**File**: `__tests__/load-test.js` (new file)

**Test Scenarios**:
```bash
# Test 1: Verify rate limit enforcement
autocannon -c 10 -d 60 -m GET http://localhost:4000/airports?query=LHR

# Test 2: Test multiple endpoints concurrently
autocannon -c 5 -d 30 -m GET http://localhost:4000/airports?query=LHR \
         -c 5 -d 30 -m GET http://localhost:4000/airlines?query=BA

# Test 3: Stress test health endpoint
autocannon -c 20 -d 30 -m GET http://localhost:4000/health
```

**Success Criteria**:
- 429 responses appear when limits are exceeded
- API remains responsive under load
- No degradation of service for compliant clients
- Memory usage remains stable

### Manual Testing Checklist

- [ ] Global rate limit enforces correctly
- [ ] Per-endpoint rate limits are independent
- [ ] Rate limit headers are present and accurate
- [ ] 429 responses include retry-after information
- [ ] MCP endpoints use session-based rate limiting
- [ ] Health endpoint has stricter limits
- [ ] Data endpoints share configuration
- [ ] Rate limits reset properly after time window
- [ ] Multiple concurrent users don't interfere
- [ ] Redis backend works when configured
- [ ] Fallback to in-memory works when Redis unavailable
- [ ] Environment variables override defaults
- [ ] Logs contain rate limit violations

## Documentation Updates

### README.md Updates

**Section**: New "Rate Limiting" section

**Content**:
```markdown
## Rate Limiting

This API implements rate limiting to ensure fair usage and protect against abuse.

### Rate Limits

#### Global Limits
- **1000 requests per 15 minutes** per IP address across all endpoints

#### Endpoint-Specific Limits
- `/health`: 60 requests per minute
- `/airports`, `/airlines`, `/aircraft`: 100 requests per minute
- `/mcp`: 200 requests per 15 minutes (per session)

### Rate Limit Headers

All responses include rate limit information in headers:
- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

### HTTP 429 Response

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

### Best Practices

1. **Implement exponential backoff**: If you receive a 429 response, wait before retrying
2. **Monitor rate limit headers**: Track `X-RateLimit-Remaining` to avoid hitting limits
3. **Use caching**: Responses include `Cache-Control` headers - cache responses for 24 hours
4. **Batch requests**: Combine multiple lookups when possible

### Configuration

Rate limits can be configured via environment variables:

```bash
RATE_LIMIT_GLOBAL_MAX=1000
RATE_LIMIT_GLOBAL_WINDOW=15m
RATE_LIMIT_HEALTH_MAX=60
RATE_LIMIT_DATA_MAX=100
RATE_LIMIT_MCP_MAX=200
```
```

### API Documentation Updates

**For each endpoint documentation**:
- Add rate limit information
- Show rate limit headers in examples
- Document 429 response format
- Provide retry recommendations

## Deployment Considerations

### Docker Deployment

**No changes required** for in-memory rate limiting. Works with existing Dockerfile.

**For Redis backend**:
- Add Redis service to deployment
- Update Dockerfile with Redis environment variables
- Update docker-compose.yml

### Environment Variables

**Required for Production**:
```bash
# Keep defaults for development
# Adjust for production based on expected traffic
RATE_LIMIT_GLOBAL_MAX=2000
RATE_LIMIT_GLOBAL_WINDOW=15m
RATE_LIMIT_HEALTH_MAX=120
RATE_LIMIT_DATA_MAX=200
RATE_LIMIT_MCP_MAX=400

# Redis (for multi-instance)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
```

### Monitoring Alerts

**Set up alerts for**:
- High rate of 429 responses (potential attack or misconfiguration)
- Single IP generating excessive traffic (potential abuse)
- Redis connection failures (if using Redis backend)
- Rate limit store errors

### Performance Impact

**Expected Overhead**:
- In-memory: ~0.1-0.5ms per request
- Redis: ~1-5ms per request (depends on network latency)
- Minimal CPU impact
- Memory: ~10KB per unique IP address tracked

**Optimization Tips**:
- Use Redis for multi-instance deployments
- Configure appropriate cache sizes
- Set realistic time windows
- Use allowlist for known good actors

## Security Considerations

### Bypass Prevention
- Don't rely on rate limiting alone for security
- Implement input validation (already done)
- Use HTTPS in production
- Monitor for distributed attacks (many IPs)

### IP Spoofing Protection
- Validate `X-Forwarded-For` header
- Use first IP in chain (user's IP, not proxies)
- Consider requiring authentication for sensitive operations

### DDoS Mitigation
- Rate limiting helps but isn't sufficient
- Use Cloudflare or AWS Shield for production
- Implement connection limiting at load balancer
- Set up automatic banning for severe violations

### Data Privacy
- Don't log full IP addresses in production (GDPR)
- Hash IPs for logging/analytics
- Retention policy for rate limit data
- Clear old entries from Redis regularly

## Rollback Plan

### If Rate Limiting Causes Issues

**Step 1**: Disable specific endpoint rate limits
```typescript
// Comment out rateLimit config for problematic endpoint
app.get('/airports', {
  // config: { rateLimit: dataEndpointRateLimit }, // Disabled temporarily
  schema: { /* ... */ },
}, async (request, reply) => {
  // handler
});
```

**Step 2**: Disable global rate limiting
```typescript
// Set global to false
await app.register(rateLimit, {
  global: false, // Disabled
  // ... other config
});
```

**Step 3**: Remove plugin entirely
```typescript
// Comment out plugin registration
// await app.register(rateLimit, { /* ... */ });
```

### Monitoring During Rollout

- Watch error rates closely
- Monitor response times
- Check for false positives
- Gather user feedback
- Track 429 response rates

## Success Metrics

### Key Performance Indicators (KPIs)

**Week 1**:
- 429 response rate < 1% of total requests
- No increase in legitimate user complaints
- 95th percentile latency increase < 10ms
- Zero rate limit-related outages

**Month 1**:
- Identified and blocked at least 3 abusive clients
- Reduced server load by limiting excessive requests
- Zero successful DDoS attempts
- Positive user feedback on API responsiveness

**Quarter 1**:
- Rate limiting prevents 10%+ of potentially abusive traffic
- API uptime maintained at 99.9%+
- Implemented Redis backend for multi-instance support
- Launched authenticated user tiers with higher limits

## Timeline and Resource Estimates

### Phase 1: Basic Rate Limiting (Immediate)
**Timeline**: 1-2 days
**Effort**: 8-12 hours
**Resources**: 1 developer
**Deliverables**:
- In-memory rate limiting implemented
- All endpoints protected
- Basic tests written
- Documentation updated

### Phase 2: Monitoring and Observability (Short-term)
**Timeline**: 3-5 days
**Effort**: 12-16 hours
**Resources**: 1 developer
**Deliverables**:
- Logging and metrics implemented
- Monitoring dashboard created
- Alerting configured
- Load tests created

### Phase 3: Redis Backend (Medium-term)
**Timeline**: 1-2 weeks
**Effort**: 20-30 hours
**Resources**: 1 developer, 1 DevOps engineer
**Deliverables**:
- Redis integration complete
- Multi-instance support
- Production deployment
- Performance benchmarks

### Phase 4: Advanced Features (Long-term)
**Timeline**: 4-6 weeks
**Effort**: 60-80 hours
**Resources**: 2 developers, 1 DevOps engineer
**Deliverables**:
- API key authentication
- Dynamic rate limiting
- Advanced monitoring
- User management portal

## Open Questions and Decisions Needed

### Technical Decisions
1. **Should we use Redis from day 1?** 
   - Recommendation: No, start with in-memory
   
2. **What should the exact rate limits be?**
   - Recommendation: Start conservative, adjust based on data
   
3. **Should health checks be rate limited?**
   - Recommendation: Yes, but with generous limits
   
4. **How to handle CI/CD testing?**
   - Recommendation: Use allowlist for testing IPs

### Business Decisions
1. **Should we offer authenticated API access with higher limits?**
   - Requires API key management system
   - Creates upgrade path for power users
   - Recommendation: Phase 4 implementation

2. **Should we implement usage-based billing?**
   - Out of scope for initial implementation
   - Consider for future commercial offering

3. **What's the process for users to request higher limits?**
   - Recommendation: GitHub issues initially
   - Later: Self-service portal

## Risks and Mitigation

### Risk 1: False Positives
**Impact**: Legitimate users blocked
**Likelihood**: Medium
**Mitigation**: 
- Start with generous limits
- Monitor and adjust based on data
- Provide clear error messages with retry times
- Allow users to report issues

### Risk 2: Performance Degradation
**Impact**: Slower API responses
**Likelihood**: Low
**Mitigation**:
- Benchmark before and after
- Use efficient rate limit store (in-memory initially)
- Monitor latency metrics
- Optimize configuration

### Risk 3: Redis Dependency (Phase 3)
**Impact**: Outage if Redis fails
**Likelihood**: Low
**Mitigation**:
- Implement graceful degradation
- Fall back to in-memory if Redis unavailable
- Set up Redis replication and monitoring
- Don't make Redis a hard dependency

### Risk 4: Distributed Attacks
**Impact**: Rate limiting per-IP insufficient
**Likelihood**: Low
**Mitigation**:
- Use Cloudflare or similar for DDoS protection
- Implement global connection limits
- Set up automatic alerting
- Have incident response plan

### Risk 5: Compatibility Issues
**Impact**: Breaking changes for existing users
**Likelihood**: Low
**Mitigation**:
- Add rate limiting headers without enforcement first
- Gradual rollout of enforcement
- Clear communication in documentation
- Version API if needed

## References and Resources

### Documentation
- [@fastify/rate-limit Documentation](https://github.com/fastify/fastify-rate-limit)
- [Fastify Plugins Guide](https://fastify.dev/docs/latest/Reference/Plugins/)
- [HTTP 429 Status Code Specification](https://tools.ietf.org/html/rfc6585#section-4)

### Best Practices
- [OWASP Rate Limiting Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting) - Good reference implementation
- [Stripe API Rate Limits](https://stripe.com/docs/rate-limits) - Industry standard example

### Tools
- Autocannon for load testing (already installed)
- Redis for distributed rate limiting
- Prometheus for metrics collection

## Conclusion

This plan provides a comprehensive roadmap for implementing rate limiting in the IATA Code Decoder API. The phased approach allows for:

1. **Quick wins**: Basic protection with minimal effort (Phase 1)
2. **Iterative improvement**: Add observability and optimization (Phase 2)
3. **Scalability**: Support for growth with Redis backend (Phase 3)
4. **Future-proofing**: Advanced features when needed (Phase 4)

The implementation prioritizes:
- ✅ User experience (generous limits, clear error messages)
- ✅ Security (protection against abuse and attacks)
- ✅ Performance (minimal overhead)
- ✅ Flexibility (configurable, easy to adjust)
- ✅ Observability (monitoring and logging)

**Next Steps**:
1. Review and approve this plan
2. Create GitHub issues for each phase
3. Begin Phase 1 implementation
4. Set up monitoring for rate limiting metrics
5. Iterate based on real-world usage data

**Estimated Total Effort**: 100-140 hours across all phases
**Estimated Timeline**: 2-3 months for full implementation

---

*This plan was created on 2026-02-03 for the IATA Code Decoder API project.*
