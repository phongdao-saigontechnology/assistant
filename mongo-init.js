// MongoDB initialization script
db = db.getSiblingDB('communications-assistant');

// Create collections with indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.messages.createIndex({ "userId": 1, "createdAt": -1 });
db.templates.createIndex({ "category": 1, "isActive": 1 });
db.guidelines.createIndex({ "company": 1, "isActive": 1 });

print('Database initialized successfully');