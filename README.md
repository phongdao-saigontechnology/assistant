# Internal Communications Assistant

An AI-powered platform for creating clear, on-brand internal messages quickly and at scale.

## Overview

The Internal Communications Assistant helps business leaders, HR teams, and communications professionals create consistent, professional internal messages using AI. It provides template libraries, brand guidelines integration, and multi-platform distribution capabilities.

## Key Features

- **AI-Powered Writing Support**: Generate messages with consistent tone and brand alignment
- **Template Library**: Pre-built templates for common communication scenarios
- **Brand Guidelines Integration**: Upload and enforce company communication standards
- **Multi-Platform Distribution**: Send to Slack, Microsoft Teams, and email
- **Role-Based Access**: Different permissions for HR, business leaders, and communications teams
- **Analytics & Insights**: Track message performance and brand consistency

## Target Users

- **HR Teams**: Communicate policy changes, events, and announcements
- **Business Leaders**: Cascade updates across departments with consistent messaging
- **Communications Teams**: Scale content creation and maintain brand standards

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: Vanilla JavaScript, Bootstrap 5
- **AI Integration**: Google Gemini 1.5 Pro
- **Integrations**: Microsoft Graph API
- **Authentication**: JWT tokens
- **Testing**: Jest, Supertest

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. Open your browser to `http://localhost:3000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `AZURE_CLIENT_ID` | Azure app client ID for Teams | No |
| `AZURE_CLIENT_SECRET` | Azure app secret for Teams | No |

## API Documentation

### Authentication

All API endpoints (except auth) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Messages
- `POST /api/messages/generate` - Generate AI message
- `POST /api/messages/save` - Save message
- `GET /api/messages` - List user messages
- `GET /api/messages/:id` - Get specific message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

#### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template (HR/Communications only)
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

#### Guidelines
- `GET /api/guidelines` - List guidelines
- `POST /api/guidelines` - Create guidelines (HR/Communications only)
- `POST /api/guidelines/upload` - Upload guideline file
- `POST /api/guidelines/:id/activate` - Activate guidelines

#### Integrations
- `POST /api/integrations/send` - Send message to platforms
- `POST /api/integrations/test-connection` - Test integration
- `GET /api/integrations/slack/channels` - Get Slack channels

## User Roles

### Business Leader
- Create and manage own messages
- Use public templates
- View active guidelines
- Access all integrations

### HR Team
- All business leader permissions
- Create and manage templates
- Create and manage guidelines
- Upload guideline files

### Communications Team
- All HR permissions
- Advanced analytics access
- Bulk operations

## Development

### Project Structure

```
src/
├── app.js              # Express app setup
├── config/
│   └── database.js     # MongoDB connection
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── models/            # Mongoose schemas
├── routes/            # API routes
├── services/          # Business logic
├── templates/         # Default templates
└── utils/             # Utility functions

public/
├── index.html         # Main HTML file
├── css/              # Stylesheets
└── js/               # Frontend JavaScript

tests/                # Test files
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js
```

### Linting

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint:fix
```

### Default Templates

The system includes 5 default template categories:

1. **Policy Update**: For communicating policy changes
2. **Leadership Announcement**: For leadership communications
3. **Event Invitation**: For company events and meetings
4. **General Update**: For regular company updates
5. **Urgent Notice**: For time-sensitive announcements

## Integration Setup

### Slack Integration

1. Create a Slack app in your workspace
2. Add bot permissions: `chat:write`, `channels:read`
3. Install the app to your workspace
4. Copy the Bot User OAuth Token
5. Configure in the application settings

### Microsoft Teams Integration

1. Register an app in Azure AD
2. Add Microsoft Graph permissions
3. Create a client secret
4. Get your tenant, team, and channel IDs
5. Configure in the application settings

### Email Integration

1. Configure SMTP settings in environment variables
2. Set up distribution lists in user preferences
3. Test connection in integration settings

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB instance
- [ ] Set strong JWT secret
- [ ] Configure Google Gemini API key
- [ ] Set up Teams integration credentials
- [ ] Set up SSL/TLS certificate
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment

```bash
# Build image
docker build -t communications-assistant .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/communications-assistant \
  -e GEMINI_API_KEY=your_key_here \
  communications-assistant
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Security

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- Input validation with Joi
- CORS protection enabled
- Helmet for security headers
- Rate limiting on API endpoints

## License

This project is licensed under the ISC License.

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details
4. Contact the development team

## Changelog

### v1.0.0 (MVP)
- Initial release
- AI-powered message generation
- Template library
- Basic integrations
- User authentication
- Role-based access control