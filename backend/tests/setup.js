const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock Resend to avoid API key requirement and network calls
jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
            }
        }))
    };
});

// Also mock the emailService explicitly if needed, but mocking resend should be enough 
// if the service just instantiates it. 
// However, the error happened at instantiation time in the module scope.
// So we need to ensure the mock is applied BEFORE the service defines the instance.
// Jest's module mocking should handle this if we define it here, but `app` require might execute first.
// We should move `require('../server')` AFTER the mock.

// Require app AFTER mocking
const app = require('../server');

let mongoServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
    // Start mongo memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect mongoose to the memory server
    // Use app.set to mock dbConnection for routes usage if necessary, 
    // but mongoose.connect sets the default connection used by models
    await mongoose.connect(uri, {
        // Mongoose 6+ defaults are good
    });

    // Pass the connection to the app if it relies on app.get('dbConnection')
    app.set('dbConnection', {
        useMongoDB: true,
        mongoose: mongoose,
        healthCheck: async () => ({ healthy: true })
    });
});

// Clear all data after each test
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
});

// Disconnect and stop server after all tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});
