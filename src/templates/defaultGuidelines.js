export const defaultGuidelines = [
  {
    name: 'Corporate Communication Standards',
    description: 'Standard communication guidelines for professional internal communications',
    content: `These guidelines ensure consistent, professional communication across all internal channels. All company communications should reflect our values of transparency, respect, and professionalism while maintaining clarity and engagement.`,
    toneGuidelines: {
      professional: 'Use formal language, clear structure, and respectful tone. Include all necessary details and maintain objectivity.',
      friendly: 'Use warm, approachable language while maintaining professionalism. Include personal touches and show appreciation.',
      urgent: 'Use direct, action-oriented language. Clearly state deadlines and consequences. Maintain professionalism despite urgency.',
      celebratory: 'Use enthusiastic, positive language. Highlight achievements and express genuine appreciation for contributions.'
    },
    brandVoice: {
      personality: ['Professional', 'Respectful', 'Clear', 'Supportive', 'Inclusive'],
      vocabulary: {
        preferred: [
          'team', 'collaborate', 'achieve', 'support', 'excellence', 
          'innovative', 'dedicated', 'committed', 'transparent', 'inclusive',
          'empower', 'growth', 'opportunity', 'success', 'together'
        ],
        avoid: [
          'guys', 'obviously', 'just', 'simply', 'easy', 'basic',
          'cheap', 'failure', 'impossible', 'never', 'always',
          'catastrophic', 'disaster', 'terrible', 'awful'
        ]
      },
      formatting: {
        useHeaders: true,
        useBulletPoints: true,
        maxParagraphLength: 4,
        includeCallToAction: true,
        signatureFormat: 'Name\\nTitle'
      }
    },
    examples: [
      {
        scenario: 'Announcing a policy change',
        goodExample: 'We are implementing a new flexible work policy to better support work-life balance. This change reflects our commitment to employee wellbeing and productivity.',
        badExample: 'Obviously, we have to change the work policy because the old one was terrible and not working.',
        explanation: 'The good example explains the positive reasoning behind the change and uses inclusive language.'
      },
      {
        scenario: 'Requesting action from employees',
        goodExample: 'Please submit your timesheet by Friday, 5 PM to ensure timely payroll processing. If you have questions, contact HR at hr@company.com.',
        badExample: 'You guys need to get your timesheets in or payroll will be a disaster.',
        explanation: 'The good example is clear, professional, and provides specific instructions with contact information.'
      },
      {
        scenario: 'Celebrating team achievements',
        goodExample: 'Congratulations to our development team for successfully launching the new feature ahead of schedule. Your dedication and collaboration made this achievement possible.',
        badExample: 'Great job dev team, you guys totally crushed it!',
        explanation: 'The good example is specific about the achievement and acknowledges the qualities that led to success.'
      }
    ],
    company: 'Default',
    isActive: true,
    version: 1
  },
  {
    name: 'Crisis Communication Guidelines',
    description: 'Guidelines for communicating during emergency or crisis situations',
    content: `During crisis situations, communication must be immediate, accurate, and reassuring while maintaining transparency. These guidelines ensure consistent messaging that prioritizes safety and maintains trust.`,
    toneGuidelines: {
      professional: 'Maintain calm, authoritative tone. Present facts clearly and avoid speculation. Focus on solutions and next steps.',
      friendly: 'Balance warmth with seriousness. Show empathy while maintaining confidence in handling the situation.',
      urgent: 'Use direct, immediate language. Clearly communicate severity and required actions. Avoid panic-inducing language while conveying urgency.',
      celebratory: 'Generally avoid celebratory tone during crisis. If celebrating resolution, acknowledge the challenges overcome and thank those involved.'
    },
    brandVoice: {
      personality: ['Calm', 'Transparent', 'Authoritative', 'Empathetic', 'Solution-focused'],
      vocabulary: {
        preferred: [
          'immediate', 'priority', 'safety', 'secure', 'coordinated', 
          'response', 'resolution', 'support', 'contact', 'update',
          'precaution', 'temporary', 'monitoring', 'assessment', 'recovery'
        ],
        avoid: [
          'panic', 'chaos', 'disaster', 'catastrophe', 'nightmare',
          'devastating', 'horrible', 'terrifying', 'doomed', 'hopeless',
          'blame', 'fault', 'negligence', 'incompetence'
        ]
      },
      formatting: {
        useHeaders: true,
        useBulletPoints: true,
        prioritizeActionItems: true,
        includeContactInfo: true,
        timestampUpdates: true
      }
    },
    examples: [
      {
        scenario: 'System outage notification',
        goodExample: 'We are currently experiencing a system outage affecting our main application. Our technical team is actively working on a resolution. We will provide updates every 30 minutes.',
        badExample: 'Our system has completely crashed and everything is broken. This is a total disaster.',
        explanation: 'The good example acknowledges the issue, shows active response, and commits to regular updates without creating panic.'
      },
      {
        scenario: 'Safety incident communication',
        goodExample: 'We have implemented additional safety precautions following an incident in Building A. All employees should follow the updated evacuation procedures posted on the intranet.',
        badExample: 'There was a terrible accident in Building A. Everyone panic and evacuate immediately!',
        explanation: 'The good example focuses on current safety measures and clear instructions rather than dwelling on the incident details.'
      }
    ],
    company: 'Default',
    isActive: true,
    version: 1
  },
  {
    name: 'Employee Recognition Guidelines',
    description: 'Best practices for recognizing and celebrating employee achievements',
    content: `Recognition communications should be specific, timely, and meaningful. They should highlight not just what was achieved, but how it aligns with company values and impacts the organization.`,
    toneGuidelines: {
      professional: 'Acknowledge achievements with specific details and impact. Maintain professionalism while showing genuine appreciation.',
      friendly: 'Use warm, personal language. Share specific examples and express genuine gratitude for contributions.',
      urgent: 'Generally not applicable for recognition, unless acknowledging urgent response to crisis.',
      celebratory: 'Express enthusiasm and pride. Highlight the significance of the achievement and its positive impact on the team/company.'
    },
    brandVoice: {
      personality: ['Appreciative', 'Specific', 'Inspiring', 'Inclusive', 'Motivating'],
      vocabulary: {
        preferred: [
          'outstanding', 'exceptional', 'dedicated', 'innovative', 'collaborative',
          'impact', 'achievement', 'excellence', 'leadership', 'commitment',
          'inspiring', 'valuable', 'significant', 'remarkable', 'exemplary'
        ],
        avoid: [
          'adequate', 'satisfactory', 'fine', 'okay', 'decent',
          'not bad', 'good enough', 'acceptable', 'standard'
        ]
      },
      formatting: {
        personalizeMessage: true,
        includeSpecificExamples: true,
        mentionImpact: true,
        acknowledgeTeamwork: true,
        encourageContinuation: true
      }
    },
    examples: [
      {
        scenario: 'Recognizing project completion',
        goodExample: 'Sarah\'s leadership on the Q4 marketing campaign resulted in a 25% increase in engagement. Her innovative approach to social media integration and collaborative work with the design team exemplifies our values of creativity and teamwork.',
        badExample: 'Sarah did a good job on the marketing project. Thanks Sarah.',
        explanation: 'The good example is specific about the achievement, quantifies the impact, and connects it to company values.'
      },
      {
        scenario: 'Team recognition',
        goodExample: 'The customer service team\'s dedication during our system migration ensured zero service interruptions. Their proactive communication with clients and flexible scheduling demonstrates exceptional commitment to customer satisfaction.',
        badExample: 'Thanks to the customer service team for working during the migration.',
        explanation: 'The good example highlights specific actions, their impact, and the values demonstrated.'
      }
    ],
    company: 'Default',
    isActive: true,
    version: 1
  }
];