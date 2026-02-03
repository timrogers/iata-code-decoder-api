# API Rate Limiting - Quick Reference

This is a quick reference guide for the API rate limiting implementation plan. For full details, see:
- 📋 **Full Plan**: `RATE_LIMITING_PLAN.md`
- 💻 **Implementation Guide**: `RATE_LIMITING_IMPLEMENTATION_EXAMPLE.md`

## TL;DR

**Status**: ✅ `@fastify/rate-limit` v10.3.0 is already installed  
**Effort**: ~4-8 hours (implementation + testing)  
**Recommendation**: Implement immediately - critical security feature

## Proposed Rate Limits

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| **Global** | 1000 req | 15 min | Baseline DoS protection |
| REST APIs | 100 req | 1 min | `/airports`, `/airlines`, `/aircraft` |
| MCP Server | 200 req | 1 min | `/mcp` (POST/GET/DELETE) |
| Health Check | 60 req | 1 min | `/health` |

## Key Features

✅ **IP-based rate limiting** (default)  
✅ **Per-endpoint limits** (configurable)  
✅ **Development mode bypass** (NODE_ENV=development)  
✅ **IP allowlist support** (for monitoring tools)  
✅ **Standard 429 responses** with Retry-After header  
✅ **Rate limit headers** (X-RateLimit-Limit, -Remaining, -Reset)  
✅ **Environment variable configuration** (optional)  
✅ **In-memory store** (default, zero dependencies)  
✅ **Redis store support** (for multi-instance deployments)

## Implementation Summary

### 1. Register Plugin (~10 lines)
```typescript
import rateLimitPlugin from '@fastify/rate-limit';

await app.register(rateLimitPlugin, {
  global: true,
  max: 1000,
  timeWindow: '15 minutes',
  // ... see implementation guide for full config
});
```

### 2. Apply to Endpoints (~5 lines per endpoint)
```typescript
const restApiRateLimitConfig = {
  config: { rateLimit: { max: 100, timeWindow: '1 minute' } }
};

app.get('/airports', { ...restApiRateLimitConfig, schema }, handler);
```

### 3. Configure via Environment Variables
```bash
GLOBAL_RATE_LIMIT_MAX=1000
REST_RATE_LIMIT_MAX=100
MCP_RATE_LIMIT_MAX=200
RATE_LIMIT_ALLOWLIST=192.168.1.100,10.0.0.50
```

## Response Format

### Success (200 OK)
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1738596600
```

### Rate Limited (429 Too Many Requests)
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1738596600

{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

## Testing Strategy

### Integration Tests
```typescript
// Test rate limit enforcement
await Promise.all(Array.from({ length: 101 }, () => 
  app.inject({ method: 'GET', url: '/airports?query=A' })
));
// Expect 101st request to return 429
```

### Load Tests
```bash
# Test with autocannon (already installed)
autocannon -c 50 -d 10 http://localhost:4000/airports?query=LHR
```

## Rollout Plan

### Phase 1: Soft Launch (Week 1)
- Deploy with 10x limits
- Monitor for issues
- Collect baseline metrics

### Phase 2: Progressive Tightening (Weeks 2-3)
- Week 2: 5x limits
- Week 3: 2x limits
- Week 4: Target limits

### Phase 3: Monitor & Tune (Ongoing)
- Review metrics monthly
- Adjust based on usage patterns

## Configuration Options

### Basic (Minimal Configuration)
- ✅ Use defaults from plan
- ✅ Skip rate limiting in development
- ✅ In-memory store

### Advanced (Optional)
- ⚠️ Environment variable overrides
- ⚠️ IP allowlist for monitoring
- ⚠️ Redis store for multi-instance
- ⚠️ Custom key generator for proxies
- ⚠️ Ban feature for repeat offenders

## Files to Modify

| File | Changes | Complexity |
|------|---------|------------|
| `src/api.ts` | Add plugin registration + endpoint configs | Medium |
| `__tests__/api.integration.test.ts` | Add rate limit test suite | Low |
| `.env.example` | ✅ Already updated | Done |
| `README.md` | Add rate limiting section | Low |

## Estimated Effort

| Task | Time | Priority |
|------|------|----------|
| Core implementation | 2-3 hours | P0 |
| Integration tests | 1-2 hours | P0 |
| Load testing | 1 hour | P1 |
| Documentation | 1 hour | P1 |
| **Total** | **5-7 hours** | |

## Decision Matrix

### Should we implement rate limiting?

| Factor | Assessment | Score |
|--------|------------|-------|
| Security need | High - API is public | ✅✅✅ |
| Implementation cost | Low - library ready | ✅✅✅ |
| Performance impact | Minimal (<1ms/req) | ✅✅ |
| Maintenance burden | Low | ✅✅ |
| User impact | Positive (fair usage) | ✅✅ |
| **Overall** | **Strongly Recommended** | **✅** |

### When should we implement it?

**Answer**: As soon as possible

**Reasoning**:
1. 🔒 Security best practice
2. 📦 Library already installed
3. ⚡ Low implementation effort
4. 🎯 No blockers
5. 🚀 Can start with conservative limits

## Quick Commands

```bash
# Install dependencies (if needed)
npm install

# Run tests
npm test

# Run load tests
autocannon -c 10 -d 30 http://localhost:4000/health

# Check current dependencies
npm list @fastify/rate-limit

# Start dev server (rate limiting disabled in dev mode)
NODE_ENV=development npm run dev

# Start with custom limits
GLOBAL_RATE_LIMIT_MAX=2000 REST_RATE_LIMIT_MAX=200 npm start
```

## Troubleshooting Quick Reference

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Limits not enforced | NODE_ENV=development | Set to production |
| All users rate limited | Shared IP (NAT) | Add to allowlist |
| Limits reset on restart | In-memory store | Use Redis for persistence |
| Different limits per instance | Local store | Use shared Redis |
| False positives | Limits too strict | Increase limits gradually |

## Success Metrics

### Week 1 (Post-Deployment)
- ✅ 0 false positives reported
- ✅ <0.1% requests receiving 429
- ✅ No performance degradation

### Month 1 (Steady State)
- ✅ Clear usage patterns identified
- ✅ Limits tuned to real traffic
- ✅ <1% requests receiving 429
- ✅ No legitimate user complaints

## Next Steps

1. **Review this plan** ✋ (you are here)
2. **Approve implementation** ⏭️
3. **Implement Phase 1** (see `RATE_LIMITING_IMPLEMENTATION_EXAMPLE.md`)
4. **Write tests** (examples provided)
5. **Deploy to staging** 
6. **Monitor & adjust**
7. **Deploy to production**

## Questions & Considerations

### Common Questions

**Q: Will this break existing users?**  
A: No, limits are generous and users will get clear 429 responses if exceeded.

**Q: What if we need higher limits for specific users?**  
A: Use IP allowlist initially, implement API keys later.

**Q: How do we handle mobile apps with many users?**  
A: Consider implementing authentication with per-user limits (future enhancement).

**Q: Will this work with a CDN?**  
A: Yes, but configure `keyGenerator` to use `X-Forwarded-For` header.

**Q: Can we disable it if there are issues?**  
A: Yes, set very high limits or set NODE_ENV=development as quick fix.

### Additional Considerations

- 🌐 **Global deployment**: May need regional rate limits
- 🔑 **Authentication**: Future enhancement for per-user limits
- 📊 **Analytics**: Consider tracking rate limit hits for insights
- 🚨 **Alerts**: Set up monitoring for spike in 429s
- 📝 **Logging**: Rate limit events are logged automatically

## Resources

- 📦 [@fastify/rate-limit documentation](https://github.com/fastify/fastify-rate-limit)
- 📚 [Fastify documentation](https://fastify.dev)
- 🔍 [Rate limiting best practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

## Document Links

- 📋 **[RATE_LIMITING_PLAN.md](./RATE_LIMITING_PLAN.md)** - Complete implementation plan (18k+ words)
- 💻 **[RATE_LIMITING_IMPLEMENTATION_EXAMPLE.md](./RATE_LIMITING_IMPLEMENTATION_EXAMPLE.md)** - Code examples and snippets
- 📖 **[README.md](./README.md)** - Main project documentation (to be updated)
- ⚙️ **[.env.example](./.env.example)** - Environment variables (already updated)

---

**Status**: ✅ Plan Complete - Ready for Implementation  
**Last Updated**: 2026-02-03  
**Review Status**: Pending Approval
