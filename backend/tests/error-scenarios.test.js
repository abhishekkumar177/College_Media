const request = require('supertest');
const app = require('../server');

require('./setup');

describe('Error Scenarios and Edge Cases', () => {
    describe('Rate Limiting', () => {
        it('should handle rate limiting for auth endpoints', async () => {
            const userData = {
                firstName: 'Rate',
                lastName: 'Limit',
                username: 'ratelimit',
                email: 'ratelimit@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            // Make multiple requests quickly
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request(app)
                        .post('/api/auth/register')
                        .send(userData)
                );
            }

            const results = await Promise.all(requests);

            // At least one should be rate limited (429)
            const rateLimited = results.some(res => res.statusCode === 429);
            expect(rateLimited).toBe(true);
        });

        it('should handle rate limiting for post creation', async () => {
            // First create a user
            const userData = {
                firstName: 'Rate',
                lastName: 'Limit',
                username: 'ratelimit_posts',
                email: 'ratelimit_posts@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send(userData);

            const authToken = registerRes.body.data.token;

            // Make multiple post requests quickly
            const requests = [];
            for (let i = 0; i < 20; i++) {
                requests.push(
                    request(app)
                        .post('/api/posts')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({ content: `Spam post ${i}`, isPublic: true })
                );
            }

            const results = await Promise.all(requests);

            // At least one should be rate limited
            const rateLimited = results.some(res => res.statusCode === 429);
            expect(rateLimited).toBe(true);
        });
    });

    describe('Input Validation Edge Cases', () => {
        let authToken;

        beforeAll(async () => {
            const userData = {
                firstName: 'Edge',
                lastName: 'Case',
                username: 'edgecase',
                email: 'edgecase@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerRes.body.data.token;
        });

        it('should handle extremely long content', async () => {
            const longContent = 'a'.repeat(10000); // 10k characters

            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: longContent, isPublic: true });

            // Should either succeed or fail with validation error
            expect([200, 201, 400]).toContain(res.statusCode);
        });

        it('should handle special characters in content', async () => {
            const specialContent = 'Special chars: àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ @#$%^&*()';

            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: specialContent, isPublic: true });

            expect([200, 201]).toContain(res.statusCode);
        });

        it('should handle empty arrays and null values', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Test with empty arrays',
                    images: [],
                    tags: null,
                    isPublic: true
                });

            expect([200, 201]).toContain(res.statusCode);
        });

        it('should handle malformed JSON', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/json')
                .send('{ invalid json }');

            expect(res.statusCode).toBe(400);
        });
    });

    describe('Database Error Handling', () => {
        it('should handle database connection issues gracefully', async () => {
            // This test would require mocking database disconnection
            // For now, we'll test with invalid ObjectIds
            const res = await request(app)
                .get('/api/posts/invalid-object-id');

            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
        });

        it('should handle concurrent requests', async () => {
            const userData = {
                firstName: 'Concurrent',
                lastName: 'User',
                username: 'concurrent',
                email: 'concurrent@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            // Make concurrent registration requests
            const requests = [];
            for (let i = 0; i < 5; i++) {
                requests.push(
                    request(app)
                        .post('/api/auth/register')
                        .send({
                            ...userData,
                            username: `concurrent${i}`,
                            email: `concurrent${i}@example.com`
                        })
                );
            }

            const results = await Promise.all(requests);

            // All should either succeed or fail gracefully
            results.forEach(res => {
                expect([200, 201, 400, 409]).toContain(res.statusCode);
            });
        });
    });

    describe('File Upload Edge Cases', () => {
        let authToken;

        beforeAll(async () => {
            const userData = {
                firstName: 'File',
                lastName: 'Upload',
                username: 'fileupload',
                email: 'fileupload@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerRes.body.data.token;
        });

        it('should handle invalid file types', async () => {
            const res = await request(app)
                .post('/api/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('invalid file content'), {
                    filename: 'test.exe',
                    contentType: 'application/x-msdownload'
                });

            expect([400, 415]).toContain(res.statusCode);
        });

        it('should handle oversized files', async () => {
            const largeBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB

            const res = await request(app)
                .post('/api/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', largeBuffer, {
                    filename: 'large-file.jpg',
                    contentType: 'image/jpeg'
                });

            expect([400, 413]).toContain(res.statusCode);
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should handle expired tokens', async () => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.fake';

            const res = await request(app)
                .get('/api/posts')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should handle malformed tokens', async () => {
            const malformedTokens = [
                'not-a-jwt',
                'Bearer not-a-jwt',
                'Bearer malformed.jwt.token',
                ''
            ];

            for (const token of malformedTokens) {
                const res = await request(app)
                    .get('/api/posts')
                    .set('Authorization', token);

                expect(res.statusCode).toBe(401);
            }
        });

        it('should handle missing authorization header', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ content: 'Should fail' });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Performance and Load Testing', () => {
        it('should handle multiple simultaneous requests', async () => {
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request(app)
                        .get('/api/health')
                );
            }

            const startTime = Date.now();
            const results = await Promise.all(requests);
            const endTime = Date.now();

            // All requests should succeed
            results.forEach(res => {
                expect(res.statusCode).toBe(200);
            });

            // Should complete within reasonable time (less than 5 seconds)
            expect(endTime - startTime).toBeLessThan(5000);
        });

        it('should handle memory-intensive operations', async () => {
            // Test with large dataset if available
            const res = await request(app)
                .get('/api/posts?page=1&limit=100');

            expect([200, 404]).toContain(res.statusCode); // 404 if no posts exist
        });
    });
});