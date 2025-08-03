// Utility functions for Vercel serverless functions

export function handleCORS(req, res) {
  const allowedOrigins = [
    'https://localhost:3000',
    'https://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-User-ID');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

export function validateRequest(body) {
  const errors = [];
  
  if (!body) {
    return { valid: false, errors: ['Request body is required'] };
  }
  
  const { documentText, documentStructure, analysisMode, userId } = body;
  
  // Validate document text OR document structure
  if (!documentText && !documentStructure) {
    errors.push('Either documentText or documentStructure is required');
  } else if (documentText) {
    // Validate plain text format
    if (typeof documentText !== 'string') {
      errors.push('documentText must be a string');
    } else if (documentText.length < 100) {
      errors.push('documentText is too short (minimum 100 characters)');
    } else if (documentText.length > 200000) {
      errors.push('documentText is too long (maximum 200,000 characters)');
    }
  } else if (documentStructure) {
    // Validate structured format
    if (typeof documentStructure !== 'object') {
      errors.push('documentStructure must be an object');
    } else if (!documentStructure.fullText) {
      errors.push('documentStructure.fullText is required');
    } else if (!documentStructure.paragraphs || !Array.isArray(documentStructure.paragraphs)) {
      errors.push('documentStructure.paragraphs must be an array');
    } else if (documentStructure.fullText.length < 100) {
      errors.push('documentStructure.fullText is too short (minimum 100 characters)');
    } else if (documentStructure.fullText.length > 200000) {
      errors.push('documentStructure.fullText is too long (maximum 200,000 characters)');
    }
  }
  
  // Validate analysis mode
  if (analysisMode && !['llm', 'rules', 'hybrid'].includes(analysisMode)) {
    errors.push('analysisMode must be one of: llm, rules, hybrid');
  }
  
  // Validate user ID (optional but if provided, should be valid)
  if (userId && (typeof userId !== 'string' || userId.length > 100)) {
    errors.push('userId must be a string with maximum 100 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

export function generateJobId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `job_${timestamp}_${random}`;
}

export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  
  // Remove potential harmful content
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function logRequest(req, startTime, result) {
  const duration = Date.now() - startTime;
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length'],
    duration: duration,
    success: !result.error,
    error: result.error || null,
    issues: result.data?.summary?.totalIssues || 0
  };
  
  console.log('Request processed:', JSON.stringify(logData));
}

export function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
}

export function isValidApiKey(apiKey) {
  // For development, allow any key
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, validate against stored keys
  const validKeys = (process.env.VALID_API_KEYS || '').split(',');
  return validKeys.includes(apiKey);
}

export function getUserIdFromApiKey(apiKey) {
  // Simple mapping for demo - in production, use proper authentication
  if (process.env.NODE_ENV === 'development') {
    return 'dev_user';
  }
  
  // Hash the API key to create a consistent user ID
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `user_${Math.abs(hash)}`;
}

export function calculateCost(tokenCount, model = 'gpt-4') {
  const pricing = {
    'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
  };
  
  const modelPricing = pricing[model] || pricing['gpt-4'];
  
  // Rough estimate: assume 50% input, 50% output
  const inputTokens = tokenCount * 0.7;
  const outputTokens = tokenCount * 0.3;
  
  const cost = (inputTokens / 1000 * modelPricing.input) + 
               (outputTokens / 1000 * modelPricing.output);
  
  return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
}

export function formatError(error, includeStack = false) {
  const errorResponse = {
    error: error.message || 'Unknown error',
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
  
  if (includeStack && process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }
  
  return errorResponse;
}

export function validateEnvironment() {
  const requiredVars = ['ANTHROPIC_API_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}
