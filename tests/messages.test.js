import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Message from '../src/models/Message.js';
import { connectDB } from '../src/config/database.js';

describe('Messages', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    process.env.MONGODB_URI = 'mongodb://localhost:27017/communications-assistant-test';
    await connectDB();

    // Create test user and get auth token
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'hr',
      department: 'Human Resources',
      company: 'Test Company'
    });
    await testUser.save();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up test messages
    await Message.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Message.deleteMany({});
  });

  describe('POST /api/messages/generate', () => {
    it('should generate a message successfully', async () => {
      const messageData = {
        prompt: 'Create an announcement about a new company policy',
        category: 'policy_update',
        tone: 'professional'
      };

      const response = await request(app)
        .post('/api/messages/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(200);

      expect(response.body).toHaveProperty('subject');
      expect(response.body).toHaveProperty('content');
      expect(response.body.subject).toBeTruthy();
      expect(response.body.content).toBeTruthy();
    });

    it('should require authentication', async () => {
      const messageData = {
        prompt: 'Create an announcement',
        category: 'policy_update',
        tone: 'professional'
      };

      await request(app)
        .post('/api/messages/generate')
        .send(messageData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/messages/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate tone values', async () => {
      const messageData = {
        prompt: 'Create an announcement',
        category: 'policy_update',
        tone: 'invalid_tone'
      };

      const response = await request(app)
        .post('/api/messages/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate category values', async () => {
      const messageData = {
        prompt: 'Create an announcement',
        category: 'invalid_category',
        tone: 'professional'
      };

      const response = await request(app)
        .post('/api/messages/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/messages/save', () => {
    it('should save a message successfully', async () => {
      const messageData = {
        title: 'Test Message',
        subject: 'Test Subject',
        content: 'Test content for the message',
        originalPrompt: 'Create a test message',
        tone: 'professional',
        category: 'general_update'
      };

      const response = await request(app)
        .post('/api/messages/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe(messageData.title);
      expect(response.body.data.createdBy).toBeTruthy();
    });

    it('should require authentication', async () => {
      const messageData = {
        title: 'Test Message',
        subject: 'Test Subject',
        content: 'Test content',
        originalPrompt: 'Create a test message',
        tone: 'professional',
        category: 'general_update'
      };

      await request(app)
        .post('/api/messages/save')
        .send(messageData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/messages/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/messages', () => {
    beforeEach(async () => {
      // Create test messages
      await Message.create([
        {
          title: 'Message 1',
          subject: 'Subject 1',
          content: 'Content 1',
          originalPrompt: 'Prompt 1',
          tone: 'professional',
          category: 'general_update',
          createdBy: testUser._id
        },
        {
          title: 'Message 2',
          subject: 'Subject 2',
          content: 'Content 2',
          originalPrompt: 'Prompt 2',
          tone: 'friendly',
          category: 'event_invitation',
          createdBy: testUser._id
        }
      ]);
    });

    it('should get user messages', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(2);
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(2);
    });

    it('should filter messages by status', async () => {
      const response = await request(app)
        .get('/api/messages?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      // All messages should be draft by default
      expect(response.body.messages).toHaveLength(2);
    });

    it('should filter messages by category', async () => {
      const response = await request(app)
        .get('/api/messages?category=general_update')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].category).toBe('general_update');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/messages')
        .expect(401);
    });
  });

  describe('GET /api/messages/:id', () => {
    let testMessage;

    beforeEach(async () => {
      testMessage = await Message.create({
        title: 'Test Message',
        subject: 'Test Subject',
        content: 'Test content',
        originalPrompt: 'Test prompt',
        tone: 'professional',
        category: 'general_update',
        createdBy: testUser._id
      });
    });

    it('should get a specific message', async () => {
      const response = await request(app)
        .get(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(testMessage._id.toString());
      expect(response.body.title).toBe(testMessage.title);
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow access to other users messages', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        role: 'hr',
        department: 'HR',
        company: 'Other Company'
      });
      await otherUser.save();

      // Login as other user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        });

      const otherAuthToken = loginResponse.body.token;

      // Try to access original user's message
      await request(app)
        .get(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(404);

      // Clean up
      await User.findByIdAndDelete(otherUser._id);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/messages/${testMessage._id}`)
        .expect(401);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    let testMessage;

    beforeEach(async () => {
      testMessage = await Message.create({
        title: 'Test Message',
        subject: 'Test Subject',
        content: 'Test content',
        originalPrompt: 'Test prompt',
        tone: 'professional',
        category: 'general_update',
        createdBy: testUser._id
      });
    });

    it('should delete a message', async () => {
      const response = await request(app)
        .delete(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      
      // Verify message is deleted
      const deletedMessage = await Message.findById(testMessage._id);
      expect(deletedMessage).toBeNull();
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/messages/${testMessage._id}`)
        .expect(401);
    });
  });
});