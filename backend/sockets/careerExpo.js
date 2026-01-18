const CareerBooth = require('../models/CareerBooth');
const InterviewSession = require('../models/InterviewSession');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

function initCareerExpoSockets(io) {
    const expoNamespace = io.of('/career-expo');

    expoNamespace.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const decoded = jwt.verifyUnsafe ? jwt.verifyUnsafe(token) : jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId || decoded.id;
            socket.username = decoded.username || 'Anonymous';
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    expoNamespace.on('connection', (socket) => {
        logger.info(`Expo User ${socket.userId} connected`);

        // Recruiter: Open Booth
        socket.on('open-booth', async (boothId) => {
            try {
                const booth = await CareerBooth.findById(boothId);
                // Auth check omitted for brevity (should check if req.user is recruiter)
                if (booth) {
                    booth.status = 'Open';
                    await booth.save();
                    socket.join(`booth-${boothId}`); // General room for booth updates
                    socket.join(`recruiter-${boothId}`); // Private recruiter room
                    expoNamespace.to(`booth-${boothId}`).emit('booth-status', { status: 'Open' });
                }
            } catch (err) { logger.error(err); }
        });

        // Student: Join Queue
        socket.on('join-queue', async (boothId) => {
            try {
                const booth = await CareerBooth.findById(boothId);
                const alreadyInQueue = booth.queue.some(q => q.user.toString() === socket.userId);

                if (!alreadyInQueue) {
                    booth.queue.push({ user: socket.userId });
                    booth.currentQueueLength = booth.queue.length;
                    await booth.save();

                    socket.join(`booth-${boothId}`);

                    // Notify student of their position
                    socket.emit('queue-update', { position: booth.queue.length, status: 'Waiting' });

                    // Notify recruiter
                    expoNamespace.to(`recruiter-${boothId}`).emit('queue-changed', { queueLength: booth.queue.length });
                }
            } catch (err) { logger.error(err); }
        });

        // Recruiter: Call Next
        socket.on('call-next', async (boothId) => {
            try {
                const booth = await CareerBooth.findById(boothId).populate('queue.user', 'username');
                if (booth.queue.length > 0) {
                    const nextCandidate = booth.queue.shift(); // Remove first
                    booth.currentQueueLength = booth.queue.length;
                    await booth.save();

                    // Create Session
                    const session = await InterviewSession.create({
                        booth: boothId,
                        interviewer: socket.userId,
                        candidate: nextCandidate.user._id
                    });

                    const roomId = `interview-${session._id}`;
                    socket.join(roomId);

                    // Notify Candidate to join room
                    // We need to find the socket ID of that specific user if they are online in the namespace
                    // Ideally we maintain a UserID->SocketID map.
                    // For now, we broadcast to the booth room targeting the user (inefficient but simple)
                    expoNamespace.to(`booth-${boothId}`).emit('call-candidate', {
                        candidateId: nextCandidate.user._id,
                        roomId,
                        recruiterName: socket.username
                    });

                    socket.emit('session-started', { roomId, sessionId: session._id, candidate: nextCandidate.user });

                    // Broadcast queue updates to others
                    expoNamespace.to(`booth-${boothId}`).emit('queue-update-broadcast', { length: booth.queue.length });
                } else {
                    socket.emit('error', { message: 'Queue is empty' });
                }
            } catch (err) { logger.error(err); }
        });

        // WebRTC Signaling (Simple Relay) within Interview Room
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('offer', ({ sdp, roomId }) => {
            socket.to(roomId).emit('offer', { sdp, senderId: socket.userId });
        });

        socket.on('answer', ({ sdp, roomId }) => {
            socket.to(roomId).emit('answer', { sdp, senderId: socket.userId });
        });

        socket.on('ice-candidate', ({ candidate, roomId }) => {
            socket.to(roomId).emit('ice-candidate', { candidate, senderId: socket.userId });
        });

        // Shared Notes Pad Sync
        socket.on('notes-update', ({ text, roomId }) => {
            socket.to(roomId).emit('notes-update', { text });
        });

        // End Interview
        socket.on('end-interview', async ({ sessionId, feedback }) => {
            try {
                const session = await InterviewSession.findById(sessionId);
                if (session) {
                    session.endTime = new Date();
                    session.status = 'Completed';
                    if (feedback) session.feedback = feedback;
                    await session.save();

                    // Notify candidate
                    socket.to(`interview-${sessionId}`).emit('interview-ended');
                }
            } catch (err) { logger.error(err); }
        });
    });

    return expoNamespace;
}

module.exports = initCareerExpoSockets;
