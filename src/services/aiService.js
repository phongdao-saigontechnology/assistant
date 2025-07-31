import OpenAI from 'openai';
import Guidelines from '../models/Guidelines.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const generatedContent = completion.choices[0].message.content;
      const analysis = await this.analyzeContent(generatedContent, guidelines);

      return {
        content: generatedContent,
        analysis,
        tokensUsed: completion.usage.total_tokens
      };
    } catch (error) {
      console.error('AI generation error:', error);
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

      const analysis = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      return JSON.parse(analysis.choices[0].message.content);
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
    
    return await Guidelines.findOne({ 
      company, 
      isActive: true 
    }).sort({ createdAt: -1 });
  }

  async improveMessage(originalContent, feedback, guidelines) {
    const improvementPrompt = `Improve this internal communication based on the feedback provided:

Original message: ${originalContent}

Feedback: ${feedback}

${guidelines ? `Company Guidelines: ${guidelines.content}` : ''}

Please provide an improved version maintaining the same structure (SUBJECT: / BODY:)`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: improvementPrompt }],
        temperature: 0.6,
        max_tokens: 1500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Improvement error:', error);
      throw new Error('Failed to improve content');
    }
  }
}

export default new AIService();