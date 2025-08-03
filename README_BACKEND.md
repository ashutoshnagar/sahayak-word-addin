# Sahayak Word Add-in Backend Service

Backend service for the Sahayak Word add-in, providing LLM-powered document analysis using Anthropic's Claude 3.5 Sonnet.

## Architecture

```
Word Add-in → Vercel API → Anthropic Claude → Document Analysis Results
```

## Deployment on Vercel

### 1. Prerequisites

- Vercel account
- Anthropic API key (Claude 3.5 Sonnet access)
- Node.js 18+ (for local development)

### 2. Environment Variables

Set these in your Vercel dashboard or via CLI:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
NODE_ENV=production
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add ANTHROPIC_API_KEY
```

#### Option B: Via GitHub Integration
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### 4. Verify Deployment

Check health endpoint:
```bash
curl https://your-deployment.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "anthropic": "configured",
    "cors": "enabled"
  }
}
```

## API Endpoints

### POST /api/v1/analyze

Analyze document for compliance violations.

**Request:**
```json
{
  "documentText": "Document content here...",
  "analysisMode": "llm",
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "processingTime": 8500,
  "data": {
    "summary": {
      "totalIssues": 5,
      "critical": 2,
      "warnings": 2,
      "suggestions": 1
    },
    "issues": [
      {
        "id": "font_001",
        "category": "Font",
        "title": "Incorrect Font Size",
        "description": "Heading should be 16pt, found 17pt",
        "severity": "Critical",
        "location": {
          "startIndex": 150,
          "endIndex": 167,
          "exactText": "Executive Summary",
          "context": "...report. Executive Summary This section..."
        },
        "autoFixable": true,
        "fix": {
          "action": "changeFontSize",
          "newValue": "16pt"
        }
      }
    ]
  }
}
```

### GET /api/health

Health check endpoint for monitoring.

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export ANTHROPIC_API_KEY=your_key_here

# Start local server (frontend)
npm run dev

# Test API endpoint locally
curl -X POST http://localhost:3000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"documentText":"Test document content here"}'
```

## Configuration

### Vercel Configuration (vercel.json)

- Node.js 18 runtime
- 30-second timeout for analysis
- CORS headers for Word add-in integration
- Environment variable mapping

### Security Features

- CORS protection
- Input validation
- Request size limits (200KB max document)
- Error handling and sanitization

### Performance

- Optimized for Vercel serverless functions
- Concurrent request handling
- Memory-efficient document processing
- Response caching recommendations

## Monitoring

- Health check endpoint
- Structured logging
- Error tracking
- Processing time metrics

## Costs

- Anthropic Claude API usage
- Vercel function invocations
- Estimated cost: $0.02-0.05 per document analysis

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Check ANTHROPIC_API_KEY is set correctly
   - Verify API key has Claude access

2. **Timeout Errors**
   - Document may be too large (>200KB)
   - Try breaking into smaller sections

3. **CORS Issues**
   - Verify Word add-in domain in CORS settings
   - Check browser console for specific errors

4. **JSON Parse Errors**
   - Claude response format issue
   - Check logs for raw response content

### Debug Mode

Set `NODE_ENV=development` for detailed error logs.

## Support

For issues and questions:
- GitHub Issues: https://github.com/ashutoshnagar/sahayak-word-addin/issues
- Documentation: Check inline code comments
