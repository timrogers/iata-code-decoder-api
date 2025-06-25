# Security Configuration

This document outlines the security headers and best practices implemented in the IATA Code Decoder API.

## Security Headers Implemented

### 1. Content Security Policy (CSP)
- **Purpose**: Prevents Cross-Site Scripting (XSS) attacks
- **Configuration**: Restrictive policy for API-only endpoints
- **Directives**: All sources set to `'none'` as this is a JSON API with no frontend content

### 2. HTTP Strict Transport Security (HSTS)
- **Purpose**: Enforces HTTPS connections and prevents protocol downgrade attacks
- **Configuration**: 
  - Max age: 1 year (31,536,000 seconds)
  - Includes subdomains
  - Preload enabled for browser HSTS preload lists

### 3. X-Content-Type-Options
- **Purpose**: Prevents MIME type sniffing attacks
- **Value**: `nosniff`

### 4. X-Frame-Options
- **Purpose**: Prevents clickjacking attacks
- **Value**: `deny` - completely prevents embedding in frames

### 5. Referrer Policy
- **Purpose**: Controls how much referrer information is sent with requests
- **Value**: `no-referrer` - no referrer information is sent

### 6. Cross-Origin Resource Policy (CORP)
- **Purpose**: Controls how resources can be loaded cross-origin
- **Value**: `cross-origin` - allows cross-origin requests (appropriate for public API)

### 7. Cross-Origin Opener Policy (COOP)
- **Purpose**: Prevents certain cross-origin attacks
- **Value**: `same-origin`

## CORS Configuration

### Allowed Origins
- **Configuration**: All origins allowed (`origin: true`)
- **Rationale**: Public API designed for broad usage

### Allowed Methods
- `GET` - Primary method for data retrieval
- `HEAD` - For metadata requests
- `OPTIONS` - For CORS preflight requests

### Allowed Headers
- Standard headers for API consumption
- Authentication headers for future extension
- Cache control headers

### Credentials
- **Disabled**: `credentials: false`
- **Rationale**: Public API doesn't require authentication cookies

## Custom Security Headers

### X-API-Version
- **Purpose**: API version identification for clients and monitoring
- **Value**: `1.0.0`

### Rate Limiting Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- **Note**: Placeholder implementation - actual rate limiting should be implemented

### X-Security-Contact
- **Purpose**: Security researcher contact information
- **Value**: `security@example.com` (update with actual contact)

## Error Response Security

### Cache Prevention
- Error responses (4xx, 5xx) include cache prevention headers
- Prevents sensitive error information from being cached
- Headers: `Cache-Control`, `Pragma`, `Expires`

## Security Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security headers
2. **Principle of Least Privilege**: Restrictive CSP policy
3. **Secure by Default**: Conservative security settings
4. **Public API Considerations**: Appropriate CORS for public consumption
5. **Monitoring Ready**: Headers for rate limiting and version tracking

## Recommendations for Production

1. **Update Security Contact**: Replace placeholder email with actual security contact
2. **Implement Rate Limiting**: Add actual rate limiting middleware (e.g., `express-rate-limit`)
3. **Add Request Logging**: Implement security event logging
4. **Regular Security Audits**: Schedule periodic security reviews
5. **SSL/TLS Configuration**: Ensure proper HTTPS setup in production environment
6. **API Authentication**: Consider implementing API keys for usage tracking
7. **Input Validation**: Ensure all query parameters are properly validated and sanitized

## Testing Security Headers

Use tools like:
- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- `curl` with `-I` flag to inspect headers

Example:
```bash
curl -I https://your-api-domain.com/health
```

## Security Updates

- Review and update security configurations quarterly
- Monitor security advisories for Express.js and dependencies
- Update helmet and other security packages regularly