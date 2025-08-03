// Vercel serverless function for document analysis
import { LLMValidationService } from '../../lib/llmService.js';
import { validateRequest, handleCORS } from '../../lib/utils.js';

export default async function handler(req, res) {
  // Handle CORS
  handleCORS(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // Validate request
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.errors
      });
    }

    const { documentText, documentStructure, analysisMode = 'llm', userId } = req.body;

    // Initialize LLM service
    const llmService = new LLMValidationService();
    
    // For Vercel, we'll process synchronously (under 10s limit)
    console.log(`Starting analysis for user: ${userId}, mode: ${analysisMode}`);
    
    const startTime = Date.now();
    let result;
    
    if (documentStructure) {
      // Use structured document data for enhanced Claude analysis
      result = await llmService.analyzeDocument(documentStructure);
    } else {
      // Fallback to plain text (backward compatibility)
      result = await llmService.analyzeDocument({ fullText: documentText });
    }
    
    const processingTime = Date.now() - startTime;

    // Log usage for monitoring
    console.log(`Analysis completed in ${processingTime}ms, found ${result.summary.totalIssues} issues`);

    res.status(200).json({
      success: true,
      processingTime: processingTime,
      data: result,
      meta: {
        documentLength: documentText.length,
        analysisMode: analysisMode,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return appropriate error response
    const statusCode = error.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                      error.code === 'INVALID_API_KEY' ? 401 :
                      error.code === 'DOCUMENT_TOO_LARGE' ? 413 : 500;

    res.status(statusCode).json({
      error: 'Analysis failed',
      message: error.message,
      code: error.code || 'INTERNAL_ERROR'
    });
  }
}

// Export config for Vercel
export const config = {
  maxDuration: 30, // 30 seconds timeout
  regions: ['iad1'], // US East region for better OpenAI performance
};
