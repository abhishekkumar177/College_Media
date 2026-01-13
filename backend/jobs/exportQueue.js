const Queue = require('bull');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');

// Reuse Redis URL from env
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const exportQueue = new Queue('data-exports', REDIS_URL);

// Function to generate PDF
const generatePDF = async (data, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(20).text('College Media - User Data Export', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // User Profile
        doc.fontSize(16).text('Profile Information');
        doc.fontSize(12).text(JSON.stringify(data.user, null, 2));
        doc.moveDown();

        // Posts
        doc.fontSize(16).text(`Posts (${data.posts.length})`);
        data.posts.forEach((post, i) => {
            doc.fontSize(12).text(`${i + 1}. ${post.content}`);
            doc.fontSize(10).text(`Date: ${post.createdAt}`);
            doc.moveDown();
        });

        // Messages (Simplified)
        doc.fontSize(16).text(`Messages (${data.messages.length})`);
        doc.fontSize(10).text('Note: Only displaying metadata/previews for privacy.');
        data.messages.forEach((msg, i) => {
            doc.text(`${i + 1}. To/From: ${msg.partner} - ${msg.content.substring(0, 50)}...`);
        });

        doc.end();

        stream.on('finish', resolve);
        stream.on('error', reject);
    });
};

// Function to generate CSV
const generateCSV = async (data, filePath) => {
    // We'll create a zip of CSVs normally, but for simplicity, let's just export posts as the main CSV 
    // or combine them. Since json2csv handles one structure, let's export Posts as the primary CSV for now
    // or simple flattened structure. 
    // Better approach: separate CSVs zipped. But "File Export" usually implies single download.
    // Let's do Profile CSV.

    const fields = ['username', 'email', 'firstName', 'lastName', 'role', 'createdAt'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data.user);

    fs.writeFileSync(filePath, csv);
    return filePath;
};

// Process jobs
exportQueue.process(async (job) => {
    const { userId, format } = job.data;
    const exportId = job.id;
    const fileName = `export-${userId}-${Date.now()}.${format}`;
    const filePath = path.join(__dirname, '..', 'exports', fileName);

    try {
        logger.info(`Starting export job ${exportId} for user ${userId}`);

        // Aggregate Data
        const [user, posts, messages] = await Promise.all([
            User.findById(userId).lean(),
            Post.find({ author: userId }).lean(),
            Message.find({ $or: [{ sender: userId }, { receiver: userId }] }).lean()
            // Note: Message model usually has specific logic, adjusting query loosely here
        ]);

        if (!user) throw new Error('User not found');

        const fullData = {
            user: {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt
            },
            posts: posts.map(p => ({
                content: p.content,
                createdAt: p.createdAt,
                type: 'post'
            })),
            messages: messages.map(m => ({
                content: m.content,
                partner: m.sender.toString() === userId ? m.receiver : m.sender,
                type: 'message'
            }))
        };

        if (format === 'pdf') {
            await generatePDF(fullData, filePath);
        } else if (format === 'csv') {
            await generateCSV(fullData, filePath);
            // Ideally we would want multiple CSVs, but let's stick to profile CSV for this MVF (Min Viable Feature)
        } else {
            throw new Error(`Unsupported format: ${format}`);
        }

        logger.info(`Export completed: ${filePath}`);
        return { fileName, filePath };
    } catch (error) {
        logger.error(`Export failed for job ${exportId}:`, error);
        throw error;
    }
});

module.exports = exportQueue;
