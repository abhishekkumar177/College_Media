const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Setup file is automatically loaded by Jest due to jest.config.js or setupFilesAfterEnv
// But if we haven't set up jest config yet, we might need to rely on the setup logic.
require('./setup');

describe('Auth Endpoints', () => {

    const validUser = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', validUser.email);

            // Verify user exists in DB
            const user = await User.findOne({ email: validUser.email });
            expect(user).toBeTruthy();
            expect(user.username).toBe(validUser.username);
        });

        it('should fail with existing email', async () => {
            // First user
            await request(app).post('/api/auth/register').send(validUser);

            // Duplicate user
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body.data).toBeNull();
            // Message might vary slightly depending on implementation
            expect(res.body.message).toMatch(/exists/i);
        });

        it('should fail validation with invalid email', async () => {
            const invalidUser = { ...validUser, email: 'notanemail' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidUser);

            expect(res.statusCode).toEqual(400);
            // Expect validation errors
        });

        it('should fail validation with weak password', async () => {
            const weakUser = { ...validUser, password: '123' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(weakUser);

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a user before login tests
            await request(app).post('/api/auth/register').send(validUser);
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: 'WrongPassword'
                });

            expect(res.statusCode).toEqual(400); // Or 401
            expect(res.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toEqual(400); // Or 404
        });
    });
});
