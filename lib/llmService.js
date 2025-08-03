// LLM Service for document validation using Anthropic Claude
import Anthropic from '@anthropic-ai/sdk';

export class LLMValidationService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  }

  buildValidationPrompt() {
    return `You are an expert audit report compliance validator with access to complete Word document structure via Office.js. You will receive:

1. Full document text
2. Complete paragraph array with formatting information
3. Font details, styles, and spacing for each paragraph

## DOCUMENT STRUCTURE YOU'LL RECEIVE:
{
  "fullText": "complete document text",
  "paragraphs": [
    {
      "index": 0,
      "text": "INTERNAL AUDIT REPORT",
      "font": { "name": "Calibri", "size": 20 },
      "style": "Title",
      "lineSpacing": 1.15,
      "spaceAfter": 3
    },
    {
      "index": 1,
      "text": "Functional Head: aman malhotra",
      "font": { "name": "Arial", "size": 11 },
      "style": "Normal"
    }
  ]
}

## VALIDATION CATEGORIES:

### 1. FONT COMPLIANCE
- Font family must be Calibri throughout
- Font sizes: Report title (20pt), Headings (16pt), Sub-headings (13pt), Content (11pt)
- Line spacing must be 1.15 consistently

### 2. FORMAT COMPLIANCE
- Heading spacing: 3pt after headings
- Date format: MMM, DD YYYY (e.g., "Jan 15, 2024")
- Capitalization: First letter of team/policy names capitalized, "team"/"policy" lowercase, "Board" always capitalized
- Issue numbering: H.1.1→H.2.1 sequence (unique scope areas), H.1.1→H.1.2 (same scope)
- No prefixes before names (remove Mr., Ms., Miss, Mrs.)
- Acronyms: Define full form at first use, then use consistently
- Punctuation: Consistent usage throughout
- Alignment: Table headers center-aligned, content justified
- Slash spacing: Add spaces around "/" (CEO / CFO not CEO/CFO)

### 3. NUMBER COMPLIANCE
- Numbers 1-10: Write in words (except in same statement with >10 numbers, or years)
- "X out of Y": Use numerics unless both are 1-10
- Currency: INR prefix required (INR 100 lakhs)
- Large numbers: Use commas consistently (10,000 or 1,00,000 style)
- Table totals: Must calculate correctly
- Sample counts: Must match between report and annexures

### 4. COLOR COMPLIANCE
- Report ratings: Satisfactory (#92D050), Needs Improvement (#FFFF00), Not Satisfactory (#C00000)
- Issue categories: Low (#92D050), Medium (#FFFF00), High (#C00000)

### 5. CONTENT COMPLIANCE
- Include: "Management demonstrated a co-operative approach throughout the course of the audit and engaged effectively with the Internal Audit team."
- Names/Designations: Must match standard formats
- Issue references: Must match between summary and detailed sections

## CRITICAL NAVIGATION REQUIREMENTS:
- Use EXACT paragraphIndex from the paragraphs array
- Use EXACT text that exists in that specific paragraph
- This enables precise Office.js navigation: paragraphs.items[index].search(text)

## RESPONSE FORMAT:
Return ONLY this JSON structure:

{
  "summary": {
    "totalIssues": 0,
    "critical": 0,
    "warnings": 0,
    "suggestions": 0
  },
  "issues": [
    {
      "id": "font_001",
      "category": "Font",
      "title": "Incorrect Font Family",
      "description": "Font should be Calibri, found Arial",
      "severity": "Critical",
      "location": {
        "paragraphIndex": 1,
        "searchableText": "aman malhotra",
        "context": "Functional Head: aman malhotra"
      },
      "expected": "Calibri font family",
      "autoFixable": true,
      "fix": {
        "action": "changeFontFamily",
        "newValue": "Calibri"
      }
    }
  ]
}

## EXAMPLES:

### Font Issue:
- Paragraph 1 has font.name = "Arial" but should be "Calibri"
- Return: paragraphIndex: 1, searchableText: "aman malhotra"

### Capitalization Issue:
- Paragraph 3 has text: "risk team should review"
- Return: paragraphIndex: 3, searchableText: "risk team"

### Date Format Issue:
- Paragraph 0 has text: "Issuance Date:May 20, 2025"
- Return: paragraphIndex: 0, searchableText: "May 20, 2025"

CRITICAL: The paragraphIndex must match the exact index from the paragraphs array you receive. The searchableText must be exact text that exists in that specific paragraph for Office.js navigation to work.`;
  }

  async analyzeDocument(documentStructure) {
    try {
      console.log(`Analyzing document with ${documentStructure.paragraphs?.length || 0} paragraphs`);

      // Validate document size
      if (documentStructure.fullText?.length > 200000) {
        throw new Error('Document too large. Maximum size is 200,000 characters.');
      }

      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.1,
        system: this.buildValidationPrompt(),
        messages: [
          {
            role: 'user',
            content: `Analyze this audit report structure for compliance violations and return valid JSON only:\n\n${JSON.stringify(documentStructure, null, 2)}`
          }
        ]
      });

      const content = message.content[0].text;
      console.log('Claude Response received, parsing JSON...');

      let analysisResult;
      try {
        // Extract JSON from response (Claude sometimes adds extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : content;
        analysisResult = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', content);
        throw new Error('Invalid JSON response from Claude');
      }

      // Validate and process the results
      const processedResult = this.validateAndProcessResults(analysisResult, documentStructure);
      
      console.log(`Analysis completed: ${processedResult.summary.totalIssues} issues found`);
      
      return processedResult;

    } catch (error) {
      console.error('Claude Analysis failed:', error);
      
      if (error.type === 'rate_limit_error') {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      } else if (error.type === 'authentication_error') {
        throw new Error('Invalid API key. Please check your Anthropic API key.');
      } else if (error.type === 'overloaded_error') {
        throw new Error('Claude is overloaded. Please try again in a moment.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Analysis timeout. Document may be too complex.');
      }
      
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  validateAndProcessResults(analysisResult, documentStructure) {
    // Ensure required structure exists
    if (!analysisResult.summary) {
      analysisResult.summary = {
        totalIssues: 0,
        critical: 0,
        warnings: 0,
        suggestions: 0,
        documentLength: documentStructure.fullText?.length || 0
      };
    }

    if (!analysisResult.issues) {
      analysisResult.issues = [];
    }

    // Validate issues with proper paragraph indices
    const validatedIssues = [];
    let validationStats = {
      original: analysisResult.issues.length,
      validated: 0,
      invalidParagraphIndex: 0,
      missingSearchableText: 0
    };

    for (const issue of analysisResult.issues) {
      try {
        // Validate paragraph index exists
        const paragraphIndex = issue.location?.paragraphIndex;
        if (paragraphIndex === undefined || paragraphIndex < 0 || 
            paragraphIndex >= documentStructure.paragraphs.length) {
          validationStats.invalidParagraphIndex++;
          console.warn(`Invalid paragraph index for issue ${issue.id}: ${paragraphIndex}`);
          continue;
        }

        // Validate searchable text exists
        if (!issue.location?.searchableText) {
          validationStats.missingSearchableText++;
          console.warn(`Missing searchable text for issue ${issue.id}`);
          continue;
        }

        // Ensure required fields exist
        issue.id = issue.id || `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        issue.autoFixable = issue.autoFixable !== undefined ? issue.autoFixable : false;
        
        validatedIssues.push(issue);
        validationStats.validated++;

      } catch (validationError) {
        console.error(`Validation error for issue ${issue.id}:`, validationError);
      }
    }

    // Update summary with validated counts
    const summary = {
      totalIssues: validatedIssues.length,
      critical: validatedIssues.filter(i => i.severity === 'Critical').length,
      warnings: validatedIssues.filter(i => i.severity === 'Warning').length,
      suggestions: validatedIssues.filter(i => i.severity === 'Suggestion').length,
      documentLength: documentStructure.fullText?.length || 0
    };

    console.log('Validation stats:', validationStats);

    return {
      summary,
      issues: validatedIssues,
      validationStats,
      meta: {
        model: this.model,
        timestamp: new Date().toISOString(),
        processingVersion: '2.0'
      }
    };
  }
}
