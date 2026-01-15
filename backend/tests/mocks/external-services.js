// External Services Mocks for Testing
const AWS = require('aws-sdk');

// Mock AWS S3
jest.mock('aws-sdk', () => {
    const mockS3 = {
        upload: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Location: 'https://mock-s3-url.com/test-file.jpg',
                Key: 'test-file.jpg',
                Bucket: 'test-bucket'
            })
        }),
        deleteObject: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({})
        }),
        getSignedUrl: jest.fn().mockReturnValue('https://mock-signed-url.com')
    };

    return {
        S3: jest.fn(() => mockS3),
        config: {
            update: jest.fn()
        }
    };
});

// Mock Cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                public_id: 'test-public-id',
                secure_url: 'https://mock-cloudinary.com/test-image.jpg',
                format: 'jpg',
                width: 800,
                height: 600
            }),
            destroy: jest.fn().mockResolvedValue({ result: 'ok' })
        },
        api: {
            delete_resources: jest.fn().mockResolvedValue({ deleted: { 'test-public-id': 'deleted' } })
        }
    }
}));

// Mock Redis
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        ttl: jest.fn().mockResolvedValue(-1),
        keys: jest.fn().mockResolvedValue([]),
        exists: jest.fn().mockResolvedValue(0),
        incr: jest.fn().mockResolvedValue(1),
        publish: jest.fn().mockResolvedValue(1),
        subscribe: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        quit: jest.fn().mockResolvedValue('OK')
    }));
});

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        customers: {
            create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
            retrieve: jest.fn().mockResolvedValue({ id: 'cus_test123', email: 'test@example.com' }),
            update: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
            del: jest.fn().mockResolvedValue({ id: 'cus_test123', deleted: true })
        },
        paymentIntents: {
            create: jest.fn().mockResolvedValue({
                id: 'pi_test123',
                client_secret: 'pi_test123_secret',
                status: 'succeeded'
            }),
            retrieve: jest.fn().mockResolvedValue({
                id: 'pi_test123',
                status: 'succeeded'
            })
        },
        webhooks: {
            constructEvent: jest.fn().mockReturnValue({
                type: 'payment_intent.succeeded',
                data: { object: { id: 'pi_test123' } }
            })
        }
    }));
});

// Mock Socket.IO
jest.mock('socket.io', () => {
    const mockSocket = {
        emit: jest.fn(),
        on: jest.fn(),
        join: jest.fn(),
        leave: jest.fn(),
        disconnect: jest.fn()
    };

    const mockIo = jest.fn().mockReturnValue({
        on: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnValue({
            emit: jest.fn()
        }),
        sockets: {
            sockets: new Map([['socket1', mockSocket]])
        }
    });

    return mockIo;
});

// Mock Socket.IO Client (for testing)
jest.mock('socket.io-client', () => {
    return jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
    });
});

// Mock OpenAI
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: 'This is a mock AI response for testing.'
                        }
                    }]
                })
            }
        },
        images: {
            generate: jest.fn().mockResolvedValue({
                data: [{
                    url: 'https://mock-openai-image.com/generated-image.png'
                }]
            })
        }
    }));
});

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: jest.fn().mockReturnValue('This is a mock Google AI response for testing.')
                    }
                })
            })
        }))
    };
});

// Mock file system operations
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    promises: {
        ...jest.requireActual('fs').promises,
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('mock file content'),
        unlink: jest.fn().mockResolvedValue(undefined),
        mkdir: jest.fn().mockResolvedValue(undefined),
        access: jest.fn().mockResolvedValue(undefined)
    }
}));

// Mock multer for file uploads
jest.mock('multer', () => {
    const multer = () => ({
        single: jest.fn().mockReturnValue((req, res, next) => {
            req.file = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '/tmp',
                filename: 'test-123.jpg',
                path: '/tmp/test-123.jpg',
                size: 1024
            };
            next();
        }),
        array: jest.fn().mockReturnValue((req, res, next) => {
            req.files = [{
                fieldname: 'files',
                originalname: 'test1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '/tmp',
                filename: 'test1-123.jpg',
                path: '/tmp/test1-123.jpg',
                size: 1024
            }];
            next();
        })
    });
    multer.diskStorage = jest.fn().mockReturnValue({});
    return multer;
});

// Mock fluent-ffmpeg
jest.mock('fluent-ffmpeg', () => {
    return jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        videoCodec: jest.fn().mockReturnThis(),
        audioCodec: jest.fn().mockReturnThis(),
        size: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        run: jest.fn().mockImplementation(function() {
            // Simulate successful completion
            setTimeout(() => {
                const progressCallback = this.on.mock.calls.find(call => call[0] === 'progress')?.[1];
                const endCallback = this.on.mock.calls.find(call => call[0] === 'end')?.[1];

                if (progressCallback) progressCallback({ percent: 100 });
                if (endCallback) endCallback();
            }, 100);
        })
    });
});

// Global test utilities
global.testUtils = {
    createMockUser: (overrides = {}) => ({
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'student',
        isVerified: true,
        createdAt: new Date(),
        ...overrides
    }),

    createMockPost: (overrides = {}) => ({
        _id: '507f1f77bcf86cd799439012',
        content: 'Test post content',
        author: '507f1f77bcf86cd799439011',
        likes: [],
        comments: [],
        createdAt: new Date(),
        ...overrides
    }),

    createMockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        user: global.testUtils.createMockUser(),
        headers: { authorization: 'Bearer mock-token' },
        ...overrides
    }),

    createMockResponse: () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis()
        };
        return res;
    },

    createMockNext: () => jest.fn()
};