# Security Headers Configuration

## Overview
Comprehensive security headers have been implemented for the IATA Code Decoder API using Helmet.js middleware and custom configurations.

## Security Headers Implemented

### 1. Content Security Policy (CSP)
- Prevents XSS attacks by controlling resource loading
- Only allows resources from same origin
- Blocks dangerous elements like objects and frames

### 2. HTTP Strict Transport Security (HSTS)
- Forces HTTPS connections for 1 year
- Includes subdomains and preload directive

### 3. X-Frame-Options: DENY
- Prevents clickjacking by blocking iframe embedding

### 4. X-Content-Type-Options: nosniff
- Prevents MIME type sniffing attacks

### 5. Referrer Policy: no-referrer
- Prevents leaking referrer information

### 6. Permissions Policy
- Disables sensitive browser features like geolocation, camera, microphone

### 7. Expect-CT Header
- Enforces Certificate Transparency monitoring

### 8. X-Powered-By Removal
- Hides server technology stack information

## Implementation Details

The security configuration is added in `src/api.ts` using:
- Helmet.js middleware with comprehensive settings
- Custom middleware for additional headers
- Proper ordering before other middleware

## Testing

Test security headers using:
- SecurityHeaders.com
- Mozilla Observatory  
- OWASP ZAP

## Additional Recommendations

1. Add CORS configuration for cross-origin requests
2. Implement rate limiting
3. Add input validation
4. Use HTTPS in production
5. Regular security audits with `npm audit`

The API now includes industry-standard security headers to protect against common web vulnerabilities.