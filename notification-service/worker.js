require('dotenv').config();
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const webpush = require('web-push');

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const STREAM_KEY = 'events:notifications';
const CONSUMER_GROUP = 'notification_group';
const CONSUMER_NAME = `worker_${process.pid}`;

// Redis Client
const redis = new Redis(REDIS_URL);

// Mock Email Transporter (would use real creds in env)
const transporter = nodemailer.createTransport({
    jsonTransport: true // Just log to console for demo
});

console.log(`🚀 Notification Service Worker started (${CONSUMER_NAME})`);

// Initialize Consumer Group
async function init() {
    try {
        await redis.xgroup('CREATE', STREAM_KEY, CONSUMER_GROUP, '$', 'MKSTREAM');
        console.log('Created consumer group:', CONSUMER_GROUP);
    } catch (err) {
        if (!err.message.includes('BUSYGROUP')) {
            console.error('Group creation failed:', err);
        }
    }
    consume();
}

// Consume Loop
async function consume() {
    while (true) {
        try {
            // Read new messages
            const results = await redis.xreadgroup(
                'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
                'BLOCK', 5000,
                'COUNT', 1,
                'STREAMS', STREAM_KEY, '>'
            );

            if (results) {
                const [key, messages] = results[0];
                for (const msg of messages) {
                    const [id, fields] = msg;
                    const eventData = parseMessage(fields);

                    console.log(`📥 Processing event ${id}: ${eventData.type}`);
                    await processEvent(eventData);

                    // Acknowledge message
                    await redis.xack(STREAM_KEY, CONSUMER_GROUP, id);
                }
            }
        } catch (error) {
            console.error('Consumption error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Helper to parse Redis Stream array format
function parseMessage(fields) {
    const data = {};
    for (let i = 0; i < fields.length; i += 2) {
        data[fields[i]] = fields[i + 1];
    }
    if (data.payload) data.payload = JSON.parse(data.payload);
    return data;
}

// Event Processor
async function processEvent(event) {
    const { type, payload } = event;

    switch (type) {
        case 'USER_REGISTERED':
            await sendWelcomeEmail(payload);
            break;
        case 'POST_LIKED':
            await sendPushNotification(payload, 'Someone liked your post!');
            break;
        case 'NEW_FOLLOWER':
            await sendPushNotification(payload, 'You have a new follower!');
            break;
        default:
            console.log(`Unknown event type: ${type}`);
    }
}

// Handlers
async function sendWelcomeEmail(user) {
    console.log(`📧 Sending welcome email to ${user.email}`);
    // await transporter.sendMail({ ... });
}

async function sendPushNotification(data, message) {
    console.log(`🔔 Sending push to user ${data.targetUserId}: "${message}"`);
    // logic to fetch subscription from DB (if this service had DB access) 
    // or payload could contain subscription info.
    // For separation, this service often needs DB access or an API call to main backend.
    // We'll simulate success.
}

init();
