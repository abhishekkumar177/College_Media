const request = require('supertest');
const app = require('../server');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

require('./setup');

describe('Comments API', () => {
    let authToken;
    let testUser;
    let postId;

    beforeAll(async () => {
        // Create test user and get token
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser_comments',
            email: 'testuser_comments@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(userData);

        authToken = registerRes.body.data.token;
        testUser = registerRes.body.data.user;

        // Create a test post
        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ content: 'Test post for comments', isPublic: true });

        postId = postRes.body.data._id;
    });

    describe('POST /api/comments', () => {
        it('should create a comment successfully', async () => {
            const commentData = {
                content: 'This is a test comment',
                postId: postId
            };

            const res = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.content).toBe(commentData.content);
            expect(res.body.data.author).toBe(testUser._id);
            expect(res.body.data.postId).toBe(postId);
        });

        it('should fail without authentication', async () => {
            const commentData = {
                content: 'This should fail',
                postId: postId
            };

            const res = await request(app)
                .post('/api/comments')
                .send(commentData);

            expect(res.statusCode).toEqual(401);
            expect(res.body.success).toBe(false);
        });

        it('should fail with empty content', async () => {
            const commentData = {
                content: '',
                postId: postId
            };

            const res = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with invalid post ID', async () => {
            const commentData = {
                content: 'Comment with invalid post',
                postId: 'invalid-post-id'
            };

            const res = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData);

            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/comments/:postId', () => {
        beforeAll(async () => {
            // Create some test comments
            await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Test comment 1', postId: postId });

            await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Test comment 2', postId: postId });
        });

        it('should get comments for a post', async () => {
            const res = await request(app)
                .get(`/api/comments/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0]).toHaveProperty('content');
            expect(res.body.data[0]).toHaveProperty('author');
        });

        it('should return empty array for post with no comments', async () => {
            // Create another post without comments
            const newPostRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Post without comments', isPublic: true });

            const res = await request(app)
                .get(`/api/comments/${newPostRes.body.data._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('PUT /api/comments/:id', () => {
        let commentId;

        beforeAll(async () => {
            const commentRes = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Original comment', postId: postId });

            commentId = commentRes.body.data._id;
        });

        it('should update comment successfully', async () => {
            const updateData = {
                content: 'Updated comment content'
            };

            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.content).toBe(updateData.content);
        });

        it('should fail to update other user comment', async () => {
            // Create another user
            const otherUserData = {
                firstName: 'Other',
                lastName: 'User',
                username: 'otheruser_comments',
                email: 'other_comments@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const otherRegisterRes = await request(app)
                .post('/api/auth/register')
                .send(otherUserData);

            const otherToken = otherRegisterRes.body.data.token;

            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ content: 'Unauthorized update' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/comments/:id', () => {
        let commentId;

        beforeAll(async () => {
            const commentRes = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Comment to delete', postId: postId });

            commentId = commentRes.body.data._id;
        });

        it('should delete comment successfully', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            // Verify comment is deleted
            const getRes = await request(app)
                .get(`/api/comments/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes.statusCode).toEqual(200);
            expect(getRes.body.data.every(comment => comment._id !== commentId)).toBe(true);
        });
    });

    describe('POST /api/comments/:id/like', () => {
        let commentId;

        beforeAll(async () => {
            const commentRes = await request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Comment to like', postId: postId });

            commentId = commentRes.body.data._id;
        });

        it('should like comment successfully', async () => {
            const res = await request(app)
                .post(`/api/comments/${commentId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.likes).toContain(testUser._id);
        });

        it('should unlike comment when already liked', async () => {
            // Like first
            await request(app)
                .post(`/api/comments/${commentId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            // Unlike
            const res = await request(app)
                .post(`/api/comments/${commentId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.likes).not.toContain(testUser._id);
        });
    });
});