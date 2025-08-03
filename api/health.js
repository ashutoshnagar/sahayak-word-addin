// Health check endpoint for monitoring
import { handleCORS, validateEnvironment } from '../lib/utils.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCORS(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate environment variables
    validateEnvironment();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
        cors: 'enabled'
      },
      uptime: process.uptime ? Math.floor(process.uptime()) : 0
    };

    res.status(200).json(healthStatus);

  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
        cors: 'enabled'
      }
    });
  }
}

// Export config for Vercel
export const config = {
  maxDuration: 10
};
