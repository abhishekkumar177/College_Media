const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/aiEventAnalytics');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            organizer: req.user.id
        });
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } }) // Future events
            .sort({ date: 1 })
            .populate('organizer', 'username college');
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get event details
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'username');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Recalculate Risk Score on fetch (simulated real-time)
        const ticketCount = await Ticket.countDocuments({ event: event._id });
        event.aiRiskScore = aiService.calculateRiskScore({ ...event.toObject(), capacity: 500 }, ticketCount);

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Purchase Ticket / Generates QR
 * @route   POST /api/events/:id/tickets
 * @access  Private
 */
exports.purchaseTicket = async (req, res) => {
    try {
        const { tierName } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const tier = event.ticketTiers.find(t => t.name === tierName);
        if (!tier) return res.status(400).json({ success: false, message: 'Invalid ticket tier' });

        if (tier.sold >= tier.quantity) {
            return res.status(400).json({ success: false, message: 'Sold out' });
        }

        // Generate Secure Token for QR
        // Contains core info + signature from backend secret
        const ticketId = uuidv4();
        const securePayload = {
            tid: ticketId,
            eid: event._id,
            uid: req.user.id,
            tier: tierName,
            ts: Date.now()
        };
        const signedToken = jwt.sign(securePayload, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Generate QR Image Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(signedToken);

        const ticket = await Ticket.create({
            event: event._id,
            user: req.user.id,
            tierName,
            pricePaid: tier.price,
            qrCode: qrCodeDataUrl,
            secureHash: signedToken
        });

        // Update sold count
        tier.sold += 1;
        await event.save();

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get user's tickets
 * @route   GET /api/events/tickets/my
 * @access  Private
 */
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id }).populate('event');
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Validate Ticket (Organizer Only)
 * @route   POST /api/events/verify-ticket
 * @access  Private
 */
exports.verifyTicket = async (req, res) => {
    try {
        const { token } = req.body; // The scanned QR token

        // 1. Verify Signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Check Database
        const ticket = await Ticket.findOne({ secureHash: token }).populate('user', 'username');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found in system' });
        }

        const event = await Event.findById(ticket.event);

        // 3. Check Access permissions (User must be organizer)
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to scan for this event' });
        }

        // 4. Check Status
        if (ticket.status === 'Used') {
            return res.status(400).json({ success: false, message: 'Ticket ALREADY USED', ticket });
        }

        // 5. Mark as Used
        ticket.status = 'Used';
        ticket.checkedInAt = new Date();
        await ticket.save();

        res.status(200).json({ success: true, message: 'Check-in Successful', ticket });

    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid Ticket Token' });
    }
};
