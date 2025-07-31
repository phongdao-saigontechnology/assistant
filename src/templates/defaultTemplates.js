export const defaultTemplates = [
  {
    name: 'Policy Update Announcement',
    category: 'policy_update',
    description: 'Standard template for communicating policy changes to employees',
    content: {
      subject: 'Important Update: {{policyName}} Policy Changes',
      body: `Dear Team,

We are writing to inform you of important updates to our {{policyName}} policy, effective {{effectiveDate}}.

**What's Changing:**
{{changesSummary}}

**Why This Change:**
{{reasonForChange}}

**What You Need to Do:**
{{actionItems}}

**Important Dates:**
- Effective Date: {{effectiveDate}}
- Training Sessions: {{trainingDate}} (if applicable)
- Questions Deadline: {{questionsDeadline}}

If you have any questions or concerns about these changes, please don't hesitate to reach out to {{contactPerson}} at {{contactEmail}}.

Thank you for your attention to this important update.

Best regards,
{{senderName}}
{{senderTitle}}`
    },
    variables: [
      { name: 'policyName', description: 'Name of the policy being updated', type: 'text', required: true },
      { name: 'effectiveDate', description: 'When the policy changes take effect', type: 'date', required: true },
      { name: 'changesSummary', description: 'Brief summary of what is changing', type: 'text', required: true },
      { name: 'reasonForChange', description: 'Explanation of why the change is being made', type: 'text', required: true },
      { name: 'actionItems', description: 'What employees need to do', type: 'text', required: true },
      { name: 'trainingDate', description: 'Date of training sessions', type: 'date', required: false },
      { name: 'questionsDeadline', description: 'Deadline for questions', type: 'date', required: false },
      { name: 'contactPerson', description: 'Who to contact with questions', type: 'text', required: true },
      { name: 'contactEmail', description: 'Contact email address', type: 'text', required: true },
      { name: 'senderName', description: 'Name of the sender', type: 'text', required: true },
      { name: 'senderTitle', description: 'Title of the sender', type: 'text', required: true }
    ],
    tone: 'professional',
    isPublic: true
  },
  {
    name: 'Leadership Announcement',
    category: 'leadership_announcement',
    description: 'Template for important announcements from company leadership',
    content: {
      subject: '{{announcementType}}: {{mainTopic}}',
      body: `Dear {{audienceName}},

I hope this message finds you well. I am writing to share some {{announcementType}} with you regarding {{mainTopic}}.

{{mainMessage}}

**Key Points:**
{{keyPoints}}

**What This Means for You:**
{{impactOnAudience}}

**Next Steps:**
{{nextSteps}}

{{additionalInfo}}

I want to thank you for your continued {{appreciationFor}}. Your {{positiveAttribute}} continues to be the driving force behind our success.

If you have any questions or would like to discuss this further, please feel free to reach out to me directly or speak with your manager.

{{closingMessage}}

Best regards,
{{leaderName}}
{{leaderTitle}}`
    },
    variables: [
      { name: 'announcementType', description: 'Type of announcement (e.g., exciting news, important update)', type: 'text', required: true },
      { name: 'mainTopic', description: 'Main subject of the announcement', type: 'text', required: true },
      { name: 'audienceName', description: 'Who the message is addressed to', type: 'text', required: true },
      { name: 'mainMessage', description: 'The core message or announcement', type: 'text', required: true },
      { name: 'keyPoints', description: 'Important bullet points or details', type: 'text', required: true },
      { name: 'impactOnAudience', description: 'How this affects the recipients', type: 'text', required: true },
      { name: 'nextSteps', description: 'What happens next', type: 'text', required: true },
      { name: 'additionalInfo', description: 'Any additional context or information', type: 'text', required: false },
      { name: 'appreciationFor', description: 'What to thank the team for', type: 'text', required: true },
      { name: 'positiveAttribute', description: 'Positive quality of the team', type: 'text', required: true },
      { name: 'closingMessage', description: 'Final message or call to action', type: 'text', required: false },
      { name: 'leaderName', description: 'Name of the leader', type: 'text', required: true },
      { name: 'leaderTitle', description: 'Title of the leader', type: 'text', required: true }
    ],
    tone: 'professional',
    isPublic: true
  },
  {
    name: 'Event Invitation',
    category: 'event_invitation',
    description: 'Template for inviting employees to company events',
    content: {
      subject: 'You\'re Invited: {{eventName}} - {{eventDate}}',
      body: `Dear {{recipientName}},

You are cordially invited to attend {{eventName}}!

**Event Details:**
- **What:** {{eventName}}
- **When:** {{eventDate}} at {{eventTime}}
- **Where:** {{eventLocation}}
- **Duration:** {{eventDuration}}

**About the Event:**
{{eventDescription}}

**What to Expect:**
{{eventAgenda}}

**RSVP Information:**
Please confirm your attendance by {{rsvpDeadline}} by {{rsvpMethod}}.

{{additionalDetails}}

**What to Bring/Wear:**
{{dresscode}}

We're looking forward to seeing you there! This promises to be {{eventHighlight}}.

If you have any questions about the event, please contact {{organizerName}} at {{organizerContact}}.

{{closingNote}}

Best regards,
{{senderName}}
{{organizerTitle}}`
    },
    variables: [
      { name: 'recipientName', description: 'Name of the person being invited', type: 'text', required: true },
      { name: 'eventName', description: 'Name of the event', type: 'text', required: true },
      { name: 'eventDate', description: 'Date of the event', type: 'date', required: true },
      { name: 'eventTime', description: 'Time the event starts', type: 'text', required: true },
      { name: 'eventLocation', description: 'Where the event is being held', type: 'text', required: true },
      { name: 'eventDuration', description: 'How long the event will last', type: 'text', required: true },
      { name: 'eventDescription', description: 'Description of what the event is about', type: 'text', required: true },
      { name: 'eventAgenda', description: 'What will happen during the event', type: 'text', required: true },
      { name: 'rsvpDeadline', description: 'When to RSVP by', type: 'date', required: true },
      { name: 'rsvpMethod', description: 'How to RSVP', type: 'text', required: true },
      { name: 'additionalDetails', description: 'Any extra information', type: 'text', required: false },
      { name: 'dresscode', description: 'What to wear or bring', type: 'text', required: false },
      { name: 'eventHighlight', description: 'What makes this event special', type: 'text', required: true },
      { name: 'organizerName', description: 'Name of the event organizer', type: 'text', required: true },
      { name: 'organizerContact', description: 'Contact info for questions', type: 'text', required: true },
      { name: 'closingNote', description: 'Final encouraging message', type: 'text', required: false },
      { name: 'senderName', description: 'Name of the message sender', type: 'text', required: true },
      { name: 'organizerTitle', description: 'Title of the organizer', type: 'text', required: true }
    ],
    tone: 'friendly',
    isPublic: true
  },
  {
    name: 'General Company Update',
    category: 'general_update',
    description: 'Template for regular company news and updates',
    content: {
      subject: '{{updateType}}: {{mainTopic}}',
      body: `Hi Everyone,

I wanted to share some {{updateType}} with you regarding {{mainTopic}}.

{{updateContent}}

**Highlights:**
{{highlights}}

**What's Coming Next:**
{{upcomingItems}}

{{callToAction}}

As always, thank you for your continued {{acknowledgment}}. {{encouragingMessage}}

If you have any questions or feedback, please don't hesitate to reach out.

Best,
{{senderName}}`
    },
    variables: [
      { name: 'updateType', description: 'Type of update (e.g., quarterly update, project news)', type: 'text', required: true },
      { name: 'mainTopic', description: 'Main subject of the update', type: 'text', required: true },
      { name: 'updateContent', description: 'Main content of the update', type: 'text', required: true },
      { name: 'highlights', description: 'Key points or achievements to highlight', type: 'text', required: true },
      { name: 'upcomingItems', description: 'What to expect in the near future', type: 'text', required: true },
      { name: 'callToAction', description: 'Any action needed from recipients', type: 'text', required: false },
      { name: 'acknowledgment', description: 'What to thank the team for', type: 'text', required: true },
      { name: 'encouragingMessage', description: 'Positive message about the team', type: 'text', required: true },
      { name: 'senderName', description: 'Name of the sender', type: 'text', required: true }
    ],
    tone: 'friendly',
    isPublic: true
  },
  {
    name: 'Urgent Notice',
    category: 'urgent_notice',
    description: 'Template for time-sensitive important announcements',
    content: {
      subject: 'URGENT: {{urgentTopic}} - Action Required by {{deadline}}',
      body: `**URGENT NOTICE**

Dear Team,

This is an urgent communication regarding {{urgentTopic}}.

**Situation:**
{{situationDescription}}

**Immediate Action Required:**
{{actionRequired}}

**Deadline:** {{deadline}}

**Important Details:**
{{importantDetails}}

**If You Have Questions:**
Please contact {{emergencyContact}} immediately at {{emergencyPhone}} or {{emergencyEmail}}.

**Do Not Delay** - {{consequencesOfDelay}}

This matter requires your immediate attention. Please prioritize this above other tasks until completed.

Thank you for your prompt response.

{{senderName}}
{{senderTitle}}
{{urgencyLevel}}`
    },
    variables: [
      { name: 'urgentTopic', description: 'What the urgent matter is about', type: 'text', required: true },
      { name: 'deadline', description: 'When action must be completed by', type: 'date', required: true },
      { name: 'situationDescription', description: 'Explanation of the urgent situation', type: 'text', required: true },
      { name: 'actionRequired', description: 'Specific actions that must be taken', type: 'text', required: true },
      { name: 'importantDetails', description: 'Critical details about the situation', type: 'text', required: true },
      { name: 'emergencyContact', description: 'Who to contact for questions', type: 'text', required: true },
      { name: 'emergencyPhone', description: 'Emergency contact phone number', type: 'text', required: true },
      { name: 'emergencyEmail', description: 'Emergency contact email', type: 'text', required: true },
      { name: 'consequencesOfDelay', description: 'What happens if deadline is missed', type: 'text', required: true },
      { name: 'senderName', description: 'Name of the sender', type: 'text', required: true },
      { name: 'senderTitle', description: 'Title of the sender', type: 'text', required: true },
      { name: 'urgencyLevel', description: 'Level of urgency indicator', type: 'text', required: true }
    ],
    tone: 'urgent',
    isPublic: true
  }
];