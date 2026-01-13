const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Setup file
require('./setup');

describe('User Endpoints', () => {
    let authToken;
    let userId;
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testprofile',
        email: 'profile@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    beforeEach(async () => {
        // Register and login to get token
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        authToken = res.body.data.token;
        userId = res.body.data.user._id;
    });

    describe('GET /api/users/profile', () => {
        it('should get authenticated user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            // Password should not be returned
            expect(res.body.data.password).toBeUndefined();
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile successfully', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                bio: 'New bio'
            };

            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.firstName).toBe(updateData.firstName);
            expect(res.body.data.bio).toBe(updateData.bio);

            // Verify in DB
            const user = await User.findById(userId);
            expect(user.firstName).toBe(updateData.firstName);
        });
    });

    describe('RBAC: Admin Routes', () => {
        let adminToken;

        beforeEach(async () => {
            // Create an admin user manually in DB
            const adminUser = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                username: 'adminuser',
                email: 'admin@example.com',
                password: 'hashedpassword', // In real test we'd hash it or use auth flow
                role: 'admin'
            });

            // In a real integration test, we might bypass login and just generate a valid JWT manually 
            // if we have access to the secret, OR go through login flow if we seeded correctly.
            // Here, let's try to register then update role (if we could) or just use the token system.
            // Simpler approach: Register new user, then manually update role in DB, then login.

            const regRes = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Real',
                    lastName: 'Admin',
                    username: 'realadmin',
                    email: 'realadmin@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            const createdId = regRes.body.data.user._id;
            adminToken = regRes.body.data.token;

            // Update to admin
            await User.findByIdAndUpdate(createdId, { role: 'admin' });
        });

        it('should allow admin to access getting all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should deny non-admin access to getting all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`); // Normal user token

            expect(res.statusCode).toEqual(403);
        });
    });
});
