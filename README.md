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

5. Seed the database with default templates and guidelines:
```bash
# Seed both templates and guidelines
npm run seed

# Or seed individually
npm run seed:templates
npm run seed:guidelines
```

6. Open your browser to `http://localhost:3000`

## Database Seeding

The application includes comprehensive seed data to get you started quickly:

### Default Templates
- **Policy Update**: Template for communicating policy changes
- **Leadership Announcement**: Template for leadership communications  
- **Event Invitation**: Template for company events and meetings
- **General Update**: Template for regular company updates
- **Urgent Notice**: Template for time-sensitive announcements

### Default Guidelines
- **Corporate Communication Standards**: Professional communication guidelines
- **Crisis Communication Guidelines**: Guidelines for emergency situations
- **Employee Recognition Guidelines**: Best practices for recognition messages

### Seeding Commands
```bash
# Seed all data (templates + guidelines)
npm run seed

# Seed only templates
npm run seed:templates  

# Seed only guidelines
npm run seed:guidelines
```

**Note**: Seeding is idempotent - running it multiple times won't create duplicates.

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

#### Using Docker Compose (Recommended)

1. Create a `.env` file with your configuration:
```bash
# Required
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key

# Optional
MONGO_ROOT_PASSWORD=your-mongo-password
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
```

2. Start the services:
```bash
# Start all services (includes automatic database seeding)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The Docker Compose setup includes:
- **MongoDB**: Database with health checks
- **Seed Service**: Automatically seeds templates and guidelines
- **App Service**: Main application (starts after seeding completes)

#### Manual Docker Build

```bash
# Build image
docker build -t communications-assistant .

# Run with manual seeding
docker run --rm \
  -e MONGODB_URI=mongodb://mongo:27017/communications-assistant \
  -e JWT_SECRET=your_secret \
  communications-assistant npm run seed

# Run application
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/communications-assistant \
  -e GEMINI_API_KEY=your_key_here \
  -e JWT_SECRET=your_secret \
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