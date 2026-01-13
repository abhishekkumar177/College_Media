const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'College Media API',
            version: '1.0.0',
            description: 'RESTful API for College Media social platform - Connect with students and alumni',
            contact: {
                name: 'College Media Support',
                email: 'support@collegemedia.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.collegemedia.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'johndoe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        bio: { type: 'string', example: 'Computer Science student' },
                        profilePicture: { type: 'string', format: 'uri' },
                        role: { type: 'string', enum: ['student', 'alumni', 'moderator', 'admin'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        sender: { $ref: '#/components/schemas/User' },
                        receiver: { $ref: '#/components/schemas/User' },
                        content: { type: 'string', example: 'Hello!' },
                        messageType: { type: 'string', enum: ['text', 'image', 'file'] },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                user: { $ref: '#/components/schemas/User' }
                            }
                        },
                        message: { type: 'string' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object', nullable: true },
                        message: { type: 'string' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        data: { type: 'object', nullable: true },
                        message: { type: 'string', example: 'Error message' }
                    }
                },
                RegisterInput: {
                    type: 'object',
                    required: ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName'],
                    properties: {
                        username: { type: 'string', minLength: 3, maxLength: 30 },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 8 },
                        confirmPassword: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                },
                ProfileUpdateInput: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        bio: { type: 'string', maxLength: 500 }
                    }
                },
                MessageInput: {
                    type: 'object',
                    required: ['receiver', 'content'],
                    properties: {
                        receiver: { type: 'string', description: 'User ID of recipient' },
                        content: { type: 'string', maxLength: 2000 },
                        messageType: { type: 'string', enum: ['text', 'image', 'file'] }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access denied. No token provided or invalid token.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Messages', description: 'Messaging endpoints' },
            { name: 'Account', description: 'Account management endpoints' }
        ]
    },
    apis: ['./routes/*.js'] // Path to annotated route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'College Media API Docs'
    }));

    // Serve raw OpenAPI spec as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

module.exports = { setupSwagger, swaggerSpec };
