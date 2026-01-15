const request = require('supertest');
const app = require('../server');
const Post = require('../models/Post');
const User = require('../models/User');

require('./setup');

describe('Posts API', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        // Create test user and get token
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser_posts',
            email: 'testuser_posts@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(userData);

        authToken = registerRes.body.data.token;
        testUser = registerRes.body.data.user;
    });

    describe('POST /api/posts', () => {
        it('should create a new post successfully', async () => {
            const postData = {
                content: 'This is a test post content',
                images: ['https://example.com/image1.jpg'],
                isPublic: true
            };

            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.content).toBe(postData.content);
            expect(res.body.data.author).toBe(testUser._id);
        });

        it('should fail without authentication', async () => {
            const postData = {
                content: 'This should fail'
            };

            const res = await request(app)
                .post('/api/posts')
                .send(postData);

            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });

        it('should fail with empty content', async () => {
            const postData = {
                content: '',
                images: []
            };

            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/content/i);
        });

        it('should handle content moderation', async () => {
            const postData = {
                content: 'This post contains badword123', // Assuming bad words are filtered
                images: [],
                isPublic: true
            };

            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(postData);

            // Should either be moderated or rejected
            expect([200, 201, 400]).toContain(res.statusCode);
        });
    });

    describe('GET /api/posts', () => {
        beforeAll(async () => {
            // Create some test posts
            await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Test post 1', isPublic: true });

            await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Test post 2', isPublic: true });
        });

        it('should get posts feed', async () => {
            const res = await request(app)
                .get('/api/posts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.posts)).toBe(true);
            expect(res.body.data.posts.length).toBeGreaterThan(0);
        });

        it('should support pagination', async () => {
            const res = await request(app)
                .get('/api/posts?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.posts.length).toBeLessThanOrEqual(1);
            expect(res.body.data).toHaveProperty('pagination');
        });

        it('should filter by user posts', async () => {
            const res = await request(app)
                .get(`/api/posts?user=${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.posts)).toBe(true);
        });
    });

    describe('PUT /api/posts/:id', () => {
        let postId;

        beforeAll(async () => {
            const postRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Original content', isPublic: true });

            postId = postRes.body.data._id;
        });

        it('should update post successfully', async () => {
            const updateData = {
                content: 'Updated content',
                isPublic: false
            };

            const res = await request(app)
                .put(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.content).toBe(updateData.content);
            expect(res.body.data.isPublic).toBe(updateData.isPublic);
        });

        it('should fail to update other user post', async () => {
            // Create another user
            const otherUserData = {
                firstName: 'Other',
                lastName: 'User',
                username: 'otheruser',
                email: 'other@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const otherRegisterRes = await request(app)
                .post('/api/auth/register')
                .send(otherUserData);

            const otherToken = otherRegisterRes.body.data.token;

            const res = await request(app)
                .put(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ content: 'Unauthorized update' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        let postId;

        beforeAll(async () => {
            const postRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Post to delete', isPublic: true });

            postId = postRes.body.data._id;
        });

        it('should delete post successfully', async () => {
            const res = await request(app)
                .delete(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            // Verify post is deleted
            const getRes = await request(app)
                .get(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes.statusCode).toEqual(404);
        });
    });

    describe('POST /api/posts/:id/like', () => {
        let postId;

        beforeAll(async () => {
            const postRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Post to like', isPublic: true });

            postId = postRes.body.data._id;
        });

        it('should like post successfully', async () => {
            const res = await request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.likes).toContain(testUser._id);
        });

        it('should unlike post when already liked', async () => {
            // Like first
            await request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            // Unlike
            const res = await request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.likes).not.toContain(testUser._id);
        });
    });
});