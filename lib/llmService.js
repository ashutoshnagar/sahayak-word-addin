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
    return `You are an expert audit report compliance validator. Analyze the provided audit report document against the L1 Review Checklist standards and identify ALL compliance violations.

## CRITICAL REQUIREMENTS:
1. Provide EXACT character indices (startIndex, endIndex) for each issue
2. Include the exact problematic text span
3. Specify precise fixes that can be automatically applied
4. Return valid JSON only - no additional text

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

## RESPONSE FORMAT:
Return ONLY this JSON structure:

{
  "summary": {
    "totalIssues": 0,
    "critical": 0,
    "warnings": 0,
    "suggestions": 0,
    "documentLength": 0
  },
  "issues": [
    {
      "id": "unique_id",
      "category": "Font|Format|Number|Color|Content",
      "subcategory": "specific_type",
      "title": "Brief issue title",
      "description": "Detailed description of the violation",
      "severity": "Critical|Warning|Suggestion",
      "location": {
        "startIndex": 0,
        "endIndex": 0,
        "exactText": "problematic text span",
        "context": "surrounding text for verification",
        "page": 0,
        "section": "section name if identifiable"
      },
      "expected": "what should be correct",
      "autoFixable": true,
      "fix": {
        "action": "replaceText|changeFontSize|changeFontFamily|changeColor|changeSpacing",
        "newValue": "replacement value",
        "newText": "replacement text if applicable"
      },
      "rule": "specific rule from checklist that was violated"
    }
  ]
}

## EXAMPLES:

### Font Size Issue:
{
  "id": "font_001",
  "category": "Font",
  "title": "Incorrect Heading Font Size",
  "location": {
    "startIndex": 150,
    "endIndex": 167,
    "exactText": "Executive Summary",
    "context": "...report. Executive Summary This section..."
  },
  "fix": {
    "action": "changeFontSize",
    "newValue": "16pt"
  }
}

### Capitalization Issue:
{
  "id": "format_001",
  "category": "Format",
  "title": "Incorrect Capitalization",
  "location": {
    "startIndex": 245,
    "endIndex": 254,
    "exactText": "risk team",
    "context": "The risk team has identified"
  },
  "fix": {
    "action": "replaceText",
    "newText": "Risk team"
  }
}

IMPORTANT: Ensure character indices are precise - they will be used for direct Word navigation.`;
  }

  async analyzeDocument(documentText) {
    try {
      console.log(`Analyzing document of length: ${documentText.length} characters`);

      // Validate document size
      if (documentText.length > 200000) {
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
            content: `Analyze this audit report for compliance violations and return valid JSON only:\n\n${documentText}`
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
      const processedResult = this.validateAndProcessResults(analysisResult, documentText);
      
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

  validateAndProcessResults(analysisResult, originalText) {
    // Ensure required structure exists
    if (!analysisResult.summary) {
      analysisResult.summary = {
        totalIssues: 0,
        critical: 0,
        warnings: 0,
        suggestions: 0,
        documentLength: originalText.length
      };
    }

    if (!analysisResult.issues) {
      analysisResult.issues = [];
    }

    // Validate and filter issues with correct indices
    const validatedIssues = [];
    let validationStats = {
      original: analysisResult.issues.length,
      validated: 0,
      indexErrors: 0,
      textMismatches: 0
    };

    for (const issue of analysisResult.issues) {
      try {
        // Validate indices are within document bounds
        if (issue.location.startIndex < 0 || 
            issue.location.endIndex > originalText.length ||
            issue.location.startIndex >= issue.location.endIndex) {
          validationStats.indexErrors++;
          console.warn(`Invalid indices for issue ${issue.id}: ${issue.location.startIndex}-${issue.location.endIndex}`);
          continue;
        }

        // Validate exact text matches
        const actualText = originalText.substring(
          issue.location.startIndex,
          issue.location.endIndex
        );

        if (actualText !== issue.location.exactText) {
          // Try fuzzy matching for minor discrepancies
          if (this.fuzzyMatch(actualText, issue.location.exactText)) {
            issue.location.exactText = actualText; // Update to actual text
          } else {
            validationStats.textMismatches++;
            console.warn(`Text mismatch for issue ${issue.id}:`);
            console.warn(`Expected: "${issue.location.exactText}"`);
            console.warn(`Actual: "${actualText}"`);
            continue;
          }
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
      documentLength: originalText.length
    };

    console.log('Validation stats:', validationStats);

    return {
      summary,
      issues: validatedIssues,
      validationStats,
      meta: {
        model: this.model,
        timestamp: new Date().toISOString(),
        processingVersion: '1.0'
      }
    };
  }

  fuzzyMatch(str1, str2, threshold = 0.8) {
    // Simple fuzzy matching for minor text differences
    if (str1.length === 0 || str2.length === 0) return false;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return true;
    
    const similarity = (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
    return similarity >= threshold;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
