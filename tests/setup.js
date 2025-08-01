import mongoose from 'mongoose';

// Mock Google Gemini for tests
jest.mock('@google/generative-ai', () => {
  return {
    __esModule: true,
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('SUBJECT: Test Generated Subject\nBODY: This is a test generated message body with professional tone and clear communication.'),
            usageMetadata: {
              totalTokenCount: 150
            }
          }
        })
      })
    }))
  };
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/communications-assistant-test';

// Clean up database after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});