import { GoogleGenerativeAI } from '@google/generative-ai';
import Guidelines from '../models/Guidelines.js';

console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('API key length:', process.env.GEMINI_API_KEY?.length || 0);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  systemInstruction: "You are an expert internal communications assistant. Your role is to help create clear, professional, and on-brand internal messages for businesses."
});

class AIService {
  async generateMessage(prompt, options = {}) {
    const {
      tone = 'professional',
      category = 'general_update',
      company,
      userId,
      templateContent = null
    } = options;

    const guidelines = await this.getActiveGuidelines(company);
    const systemPrompt = this.buildSystemPrompt(tone, category, guidelines);
    const userPrompt = this.buildUserPrompt(prompt, templateContent, options);

    try {
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      });

      const response = result.response;
      const generatedContent = response.text();
      const analysis = await this.analyzeContent(generatedContent, guidelines);

      return {
        content: generatedContent,
        analysis,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('AI generation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errorDetails: error.errorDetails
      });
      console.error('API Key being used:', process.env.GEMINI_API_KEY ? 'Present (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'Missing');
      throw new Error('Failed to generate content');
    }
  }

  buildSystemPrompt(tone, category, guidelines) {
    let basePrompt = `You are an expert internal communications assistant. Your role is to help create clear, professional, and on-brand internal messages for businesses.

TONE: ${tone}
CATEGORY: ${category}

Your output should be structured as:
SUBJECT: [A clear, compelling subject line]
BODY: [The main message content]

Guidelines for ${tone} tone:
- Professional: Clear, respectful, formal business language
- Friendly: Warm, approachable, but still professional
- Urgent: Direct, action-oriented, emphasizes importance
- Celebratory: Positive, enthusiastic, acknowledging achievements

Category guidelines:
- policy_update: Clear explanation of changes, effective dates, and next steps
- leadership_announcement: Professional tone, clear messaging, company context
- event_invitation: Engaging, includes all necessary details (date, time, location, purpose)
- general_update: Informative, relevant to audience, actionable if needed
- urgent_notice: Direct, clear action items, deadline-focused`;

    if (guidelines) {
      basePrompt += `\n\nCOMPANY BRAND GUIDELINES:
${guidelines.content}

Brand Voice: ${guidelines.brandVoice?.personality?.join(', ') || 'Professional'}

Preferred vocabulary: ${guidelines.brandVoice?.vocabulary?.preferred?.join(', ') || 'Standard business terms'}
Avoid: ${guidelines.brandVoice?.vocabulary?.avoid?.join(', ') || 'Overly casual language'}`;

      if (guidelines.toneGuidelines?.[tone]) {
        basePrompt += `\n\nSpecific ${tone} tone guidance: ${guidelines.toneGuidelines[tone]}`;
      }
    }

    return basePrompt;
  }

  buildUserPrompt(prompt, templateContent, options) {
    let userPrompt = `Please create an internal communication message based on this request: ${prompt}`;

    if (templateContent) {
      userPrompt += `\n\nUse this template as a starting point:\nSUBJECT: ${templateContent.subject}\nBODY: ${templateContent.body}`;
    }

    if (options.targetAudience) {
      userPrompt += `\n\nTarget audience: ${options.targetAudience}`;
    }

    if (options.keyPoints) {
      userPrompt += `\n\nKey points to include: ${options.keyPoints.join(', ')}`;
    }

    if (options.callToAction) {
      userPrompt += `\n\nCall to action: ${options.callToAction}`;
    }

    return userPrompt;
  }

  async analyzeContent(content, guidelines) {
    try {
      const analysisPrompt = `Analyze this internal communication for:
1. Tonal consistency (1-10 score)
2. Clarity and readability (1-10 score)  
3. Brand alignment (1-10 score if guidelines provided)
4. Improvement suggestions

Content: ${content}

${guidelines ? `Brand Guidelines: ${guidelines.content}` : ''}

Respond in JSON format:
{
  "tonalConsistency": number,
  "clarityScore": number,
  "brandAlignment": number,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      const result = await model.generateContent(analysisPrompt, {
        temperature: 0.3,
        maxOutputTokens: 500,
      });

      const response = result.response;
      const responseText = response.text();
      
      // Clean up markdown formatting if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        tonalConsistency: 7,
        clarityScore: 7,
        brandAlignment: 7,
        suggestions: ['Consider reviewing for alignment with company guidelines']
      };
    }
  }

  async getActiveGuidelines(company) {
    if (!company) return null;
    
    return Guidelines.findOne({
      company,
      isActive: true
    }).sort({createdAt: -1});
  }

  async improveMessage(originalContent, feedback, guidelines) {
    const improvementPrompt = `Improve this internal communication based on the feedback provided:

Original message: ${originalContent}

Feedback: ${feedback}

${guidelines ? `Company Guidelines: ${guidelines.content}` : ''}

Please provide an improved version maintaining the same structure (SUBJECT: / BODY:)`;

    try {
      const result = await model.generateContent(improvementPrompt, {
        temperature: 0.6,
        maxOutputTokens: 1500,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Improvement error:', error);
      throw new Error('Failed to improve content');
    }
  }
}

export default new AIService();