// Simple in-memory rate limiting for Vercel serverless functions
// Note: This is basic rate limiting. For production, consider using Redis or external service

const rateLimitStore = new Map();

export async function rateLimit(req, options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10, // limit each IP to 10 requests per windowMs
    keyGenerator = (req) => getClientIP(req)
  } = options;

  const key = keyGenerator(req);
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupOldEntries(windowStart);
  }

  // Get or create rate limit data for this key
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData) {
    rateLimitData = {
      requests: [],
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, rateLimitData);
  }

  // Remove requests outside the current window
  rateLimitData.requests = rateLimitData.requests.filter(time => time > windowStart);

  // Check if limit exceeded
  if (rateLimitData.requests.length >= max) {
    const oldestRequest = Math.min(...rateLimitData.requests);
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    
    return {
      success: false,
      limit: max,
      remaining: 0,
      retryAfter: retryAfter,
      resetTime: rateLimitData.resetTime
    };
  }

  // Add current request
  rateLimitData.requests.push(now);
  rateLimitData.resetTime = now + windowMs;

  return {
    success: true,
    limit: max,
    remaining: max - rateLimitData.requests.length,
    retryAfter: 0,
    resetTime: rateLimitData.resetTime
  };
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
}

function cleanupOldEntries(cutoffTime) {
  const keysToDelete = [];
  
  for (const [key, data] of rateLimitStore.entries()) {
    data.requests = data.requests.filter(time => time > cutoffTime);
    
    // If no recent requests, mark for deletion
    if (data.requests.length === 0 && data.resetTime < Date.now()) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Alternative rate limiting with different strategies
export function createRateLimit(options = {}) {
  return (req) => rateLimit(req, options);
}

// Rate limit by user ID instead of IP
export async function rateLimitByUser(req, userId, options = {}) {
  return rateLimit(req, {
    ...options,
    keyGenerator: () => `user:${userId}`
  });
}

// Rate limit by API key
export async function rateLimitByApiKey(req, apiKey, options = {}) {
  return rateLimit(req, {
    ...options,
    keyGenerator: () => `api:${apiKey}`
  });
}

// Enhanced rate limiting with different limits for different endpoints
export async function rateLimitAdvanced(req, endpoint) {
  const limits = {
    '/api/v1/analyze': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 minutes
    '/api/v1/health': { windowMs: 60 * 1000, max: 60 }, // 60 per minute
    default: { windowMs: 15 * 60 * 1000, max: 10 }
  };

  const limit = limits[endpoint] || limits.default;
  return rateLimit(req, limit);
}
