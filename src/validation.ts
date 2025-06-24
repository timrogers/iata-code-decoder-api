/**
 * Validation utilities for API requests
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

/**
 * Validate and sanitize IATA code query
 * @param query Raw query string
 * @param maxLength Maximum allowed length for the code
 * @returns ValidationResult
 */
export function validateIataCodeQuery(query: any, maxLength: number): ValidationResult {
  // Check if query exists
  if (query === undefined || query === null) {
    return {
      isValid: false,
      error: 'A search query must be provided via the `query` querystring parameter',
    };
  }

  // Convert to string
  const queryStr = String(query).trim();

  // Check if empty
  if (queryStr === '') {
    return {
      isValid: false,
      error: 'Search query cannot be empty',
    };
  }

  // Check length
  if (queryStr.length > maxLength) {
    return {
      isValid: false,
      error: `Search query cannot be longer than ${maxLength} characters`,
    };
  }

  // Check for valid characters (alphanumeric only)
  if (!/^[a-zA-Z0-9]+$/.test(queryStr)) {
    return {
      isValid: false,
      error: 'Search query can only contain alphanumeric characters',
    };
  }

  return {
    isValid: true,
    sanitizedValue: queryStr,
  };
}

/**
 * Validate general query parameters
 * @param req Express request object
 * @returns boolean
 */
export function hasValidHeaders(req: any): boolean {
  // Basic header validation
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length > 500) {
    return false;
  }

  return true;
}

/**
 * Sanitize response data to prevent data leakage
 * @param data Raw data array
 * @param maxResults Maximum number of results to return
 * @returns Sanitized data array
 */
export function sanitizeResponseData(data: any[], maxResults: number = 100): any[] {
  if (!Array.isArray(data)) {
    return [];
  }

  // Limit results to prevent large responses
  return data.slice(0, maxResults);
}