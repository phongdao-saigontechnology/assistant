import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Template from '../src/models/Template.js';
import { connectDB } from '../src/config/database.js';

describe('Templates', () => {
  let authToken;
  let testUser;
  let hrUser;
  let hrAuthToken;

  beforeAll(async () => {
    // Connect to test database
    process.env.MONGODB_URI = 'mongodb://localhost:27017/communications-assistant-test';
    await connectDB();

    // Create test users
    testUser = new User({
      name: 'Test User',
      email: 'business@example.com',
      password: 'password123',
      role: 'business_leader',
      department: 'Business',
      company: 'Test Company'
    });
    await testUser.save();

    hrUser = new User({
      name: 'HR User',
      email: 'hr@example.com',
      password: 'password123',
      role: 'hr',
      department: 'Human Resources',
      company: 'Test Company'
    });
    await hrUser.save();

    // Get auth tokens
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'business@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.token;

    const hrLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hr@example.com',
        password: 'password123'
      });
    hrAuthToken = hrLoginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up test templates
    await Template.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Template.deleteMany({});
  });

  describe('POST /api/templates', () => {
    it('should create a template as HR user', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'policy_update',
        description: 'A test template for policy updates',
        content: {
          subject: 'Policy Update: {{policyName}}',
          body: 'Dear team,\n\nWe have an update to {{policyName}}.\n\nBest regards'
        },
        tone: 'professional',
        isPublic: true,
        variables: [
          {
            name: 'policyName',
            description: 'Name of the policy being updated',
            type: 'text',
            required: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(templateData.name);
      expect(response.body.data.createdBy).toBeTruthy();
    });

    it('should not allow business leaders to create templates', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'policy_update',
        description: 'A test template',
        content: {
          subject: 'Test Subject',
          body: 'Test Body'
        },
        tone: 'professional'
      };

      await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate category values', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'invalid_category',
        description: 'A test template',
        content: {
          subject: 'Test Subject',
          body: 'Test Body'
        },
        tone: 'professional'
      };

      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .send(templateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'policy_update',
        description: 'A test template',
        content: {
          subject: 'Test Subject',
          body: 'Test Body'
        }
      };

      await request(app)
        .post('/api/templates')
        .send(templateData)
        .expect(401);
    });
  });

  describe('GET /api/templates', () => {
    beforeEach(async () => {
      // Create test templates
      await Template.create([
        {
          name: 'Public Template 1',
          category: 'policy_update',
          description: 'Public template 1',
          content: {
            subject: 'Subject 1',
            body: 'Body 1'
          },
          tone: 'professional',
          isPublic: true,
          createdBy: hrUser._id
        },
        {
          name: 'Private Template',
          category: 'general_update',
          description: 'Private template',
          content: {
            subject: 'Subject 2',
            body: 'Body 2'
          },
          tone: 'friendly',
          isPublic: false,
          createdBy: hrUser._id
        },
        {
          name: 'User Template',
          category: 'event_invitation',
          description: 'User created template',
          content: {
            subject: 'Subject 3',
            body: 'Body 3'
          },
          tone: 'celebratory',
          isPublic: false,
          createdBy: testUser._id
        }
      ]);
    });

    it('should get templates accessible to user', async () => {
      const response = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body.templates).toHaveLength(2); // Public template + user's own template
    });

    it('should filter templates by category', async () => {
      const response = await request(app)
        .get('/api/templates?category=policy_update')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body.templates).toHaveLength(1);
      expect(response.body.templates[0].category).toBe('policy_update');
    });

    it('should filter templates by tone', async () => {
      const response = await request(app)
        .get('/api/templates?tone=celebratory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body.templates).toHaveLength(1);
      expect(response.body.templates[0].tone).toBe('celebratory');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/templates')
        .expect(401);
    });
  });

  describe('GET /api/templates/categories', () => {
    it('should get template categories', async () => {
      const response = await request(app)
        .get('/api/templates/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('value');
      expect(response.body[0]).toHaveProperty('label');
      expect(response.body[0]).toHaveProperty('description');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/templates/categories')
        .expect(401);
    });
  });

  describe('GET /api/templates/:id', () => {
    let publicTemplate;
    let privateTemplate;

    beforeEach(async () => {
      publicTemplate = await Template.create({
        name: 'Public Template',
        category: 'policy_update',
        description: 'A public template',
        content: {
          subject: 'Public Subject',
          body: 'Public Body'
        },
        tone: 'professional',
        isPublic: true,
        createdBy: hrUser._id
      });

      privateTemplate = await Template.create({
        name: 'Private Template',
        category: 'general_update',
        description: 'A private template',
        content: {
          subject: 'Private Subject',
          body: 'Private Body'
        },
        tone: 'friendly',
        isPublic: false,
        createdBy: hrUser._id
      });
    });

    it('should get a public template', async () => {
      const response = await request(app)
        .get(`/api/templates/${publicTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(publicTemplate._id.toString());
      expect(response.body.name).toBe(publicTemplate.name);
    });

    it('should not get a private template from another user', async () => {
      await request(app)
        .get(`/api/templates/${privateTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should get own private template', async () => {
      const response = await request(app)
        .get(`/api/templates/${privateTemplate._id}`)
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .expect(200);

      expect(response.body._id).toBe(privateTemplate._id.toString());
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/templates/${publicTemplate._id}`)
        .expect(401);
    });
  });

  describe('PUT /api/templates/:id', () => {
    let testTemplate;

    beforeEach(async () => {
      testTemplate = await Template.create({
        name: 'Test Template',
        category: 'policy_update',
        description: 'A test template',
        content: {
          subject: 'Test Subject',
          body: 'Test Body'
        },
        tone: 'professional',
        isPublic: true,
        createdBy: hrUser._id
      });
    });

    it('should update own template', async () => {
      const updateData = {
        name: 'Updated Template',
        category: 'general_update',
        description: 'Updated description',
        content: {
          subject: 'Updated Subject',
          body: 'Updated Body'
        },
        tone: 'friendly'
      };

      const response = await request(app)
        .put(`/api/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.category).toBe(updateData.category);
    });

    it('should not update other users template', async () => {
      const updateData = {
        name: 'Hacked Template',
        category: 'policy_update',
        description: 'Hacked description',
        content: {
          subject: 'Hacked Subject',
          body: 'Hacked Body'
        },
        tone: 'professional'
      };

      await request(app)
        .put(`/api/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put(`/api/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/templates/${testTemplate._id}`)
        .send({ name: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    let testTemplate;

    beforeEach(async () => {
      testTemplate = await Template.create({
        name: 'Test Template',
        category: 'policy_update',
        description: 'A test template',
        content: {
          subject: 'Test Subject',
          body: 'Test Body'
        },
        tone: 'professional',
        createdBy: hrUser._id
      });
    });

    it('should delete own template', async () => {
      const response = await request(app)
        .delete(`/api/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      
      // Verify template is deleted
      const deletedTemplate = await Template.findById(testTemplate._id);
      expect(deletedTemplate).toBeNull();
    });

    it('should not delete other users template', async () => {
      await request(app)
        .delete(`/api/templates/${testTemplate._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/api/templates/${fakeId}`)
        .set('Authorization', `Bearer ${hrAuthToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/templates/${testTemplate._id}`)
        .expect(401);
    });
  });
});