const request = require('supertest');
const app = require('../server');
const { io: ioClient } = require('socket.io-client');

require('./setup');

describe('Real-time Features Integration', () => {
    let authToken;
    let testUser;
    let clientSocket;

    beforeAll(async () => {
        // Create test user and get token
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser_realtime',
            email: 'testuser_realtime@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(userData);

        authToken = registerRes.body.data.token;
        testUser = registerRes.body.data.user;
    });

    afterAll(async () => {
        if (clientSocket) {
            clientSocket.disconnect();
        }
    });

    describe('WebSocket Connection', () => {
        it('should establish WebSocket connection', (done) => {
            clientSocket = ioClient('http://localhost:3000', {
                auth: {
                    token: authToken
                },
                transports: ['websocket', 'polling']
            });

            clientSocket.on('connect', () => {
                expect(clientSocket.connected).toBe(true);
                done();
            });

            clientSocket.on('connect_error', (error) => {
                done(error);
            });
        }, 10000);

        it('should handle authentication', (done) => {
            clientSocket.on('authenticated', (data) => {
                expect(data.userId).toBe(testUser._id);
                done();
            });

            // Trigger authentication check
            clientSocket.emit('authenticate', { token: authToken });
        });

        it('should handle invalid token', (done) => {
            const invalidSocket = ioClient('http://localhost:3000', {
                auth: {
                    token: 'invalid-token'
                }
            });

            invalidSocket.on('unauthorized', (data) => {
                expect(data.message).toMatch(/unauthorized/i);
                invalidSocket.disconnect();
                done();
            });

            invalidSocket.on('connect_error', () => {
                invalidSocket.disconnect();
                done();
            });
        });
    });

    describe('Real-time Post Updates', () => {
        let postId;

        beforeAll(async () => {
            // Create a test post
            const postRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Real-time test post', isPublic: true });

            postId = postRes.body.data._id;
        });

        it('should broadcast new post to connected users', (done) => {
            clientSocket.on('new_post', (data) => {
                expect(data.post).toHaveProperty('_id');
                expect(data.post).toHaveProperty('content');
                expect(data.post.author).toBe(testUser._id);
                done();
            });

            // Create another post to trigger the event
            request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Broadcast test post', isPublic: true })
                .catch(done);
        }, 10000);

        it('should broadcast likes in real-time', (done) => {
            clientSocket.on('post_liked', (data) => {
                expect(data.postId).toBe(postId);
                expect(data.userId).toBe(testUser._id);
                done();
            });

            // Like the post
            request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${authToken}`)
                .catch(done);
        }, 10000);
    });

    describe('Real-time Comments', () => {
        let postId;

        beforeAll(async () => {
            // Create a test post for comments
            const postRes = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Post for real-time comments', isPublic: true });

            postId = postRes.body.data._id;
        });

        it('should broadcast new comments in real-time', (done) => {
            clientSocket.on('new_comment', (data) => {
                expect(data.comment).toHaveProperty('_id');
                expect(data.comment.postId).toBe(postId);
                expect(data.comment.content).toBe('Real-time comment test');
                done();
            });

            // Create a comment
            request(app)
                .post('/api/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Real-time comment test', postId })
                .catch(done);
        }, 10000);
    });

    describe('Typing Indicators', () => {
        it('should broadcast typing indicators', (done) => {
            const roomId = 'test-room';

            clientSocket.on('user_typing', (data) => {
                expect(data.userId).toBe(testUser._id);
                expect(data.roomId).toBe(roomId);
                expect(data.isTyping).toBe(true);
                done();
            });

            // Join room and start typing
            clientSocket.emit('join_room', roomId);
            clientSocket.emit('typing_start', { roomId });
        }, 10000);

        it('should broadcast typing stop', (done) => {
            const roomId = 'test-room';

            clientSocket.on('user_stopped_typing', (data) => {
                expect(data.userId).toBe(testUser._id);
                expect(data.roomId).toBe(roomId);
                done();
            });

            clientSocket.emit('typing_stop', { roomId });
        }, 10000);
    });
});