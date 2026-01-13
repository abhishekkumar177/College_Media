const Alumni = require('../models/Alumni');
const AlumniConnection = require('../models/AlumniConnection');
const AlumniEvent = require('../models/AlumniEvent');
const User = require('../models/User');

// @desc    Create alumni profile
// @route   POST /api/alumni/profile
// @access  Private
exports.createAlumniProfile = async (req, res) => {
  try {
    const existingProfile = await Alumni.findOne({ user: req.user.id });
    
    if (existingProfile) {
      return res.status(400).json({ message: 'Alumni profile already exists' });
    }

    const alumniProfile = await Alumni.create({
      user: req.user.id,
      ...req.body
    });

    await alumniProfile.populate('user', 'name email profilePicture');

    res.status(201).json({
      success: true,
      data: alumniProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get alumni profile
// @route   GET /api/alumni/profile/:id?
// @access  Private
exports.getAlumniProfile = async (req, res) => {
  try {
    const profileId = req.params.id || req.user.id;
    
    const alumniProfile = await Alumni.findOne({ user: profileId })
      .populate('user', 'name email profilePicture');

    if (!alumniProfile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    // Check visibility permissions
    if (alumniProfile.visibility === 'private' && 
        alumniProfile.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    res.json({
      success: true,
      data: alumniProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update alumni profile
// @route   PUT /api/alumni/profile
// @access  Private
exports.updateAlumniProfile = async (req, res) => {
  try {
    let alumniProfile = await Alumni.findOne({ user: req.user.id });

    if (!alumniProfile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    // Fields that can be updated
    const allowedFields = [
      'currentCompany', 'currentPosition', 'industry', 'location', 'bio',
      'skills', 'achievements', 'workExperience', 'linkedin', 'twitter',
      'github', 'website', 'mentorshipAvailable', 'mentorshipAreas',
      'lookingForOpportunities', 'willingToHire', 'visibility'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        alumniProfile[field] = req.body[field];
      }
    });

    await alumniProfile.save();
    await alumniProfile.populate('user', 'name email profilePicture');

    res.json({
      success: true,
      data: alumniProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search/Filter alumni
// @route   GET /api/alumni/search
// @access  Private
exports.searchAlumni = async (req, res) => {
  try {
    const {
      graduationYear,
      major,
      company,
      location,
      skill,
      mentorshipAvailable,
      willingToHire,
      page = 1,
      limit = 20
    } = req.query;

    const query = { visibility: { $ne: 'private' } };

    if (graduationYear) query.graduationYear = parseInt(graduationYear);
    if (major) query.major = new RegExp(major, 'i');
    if (company) query.currentCompany = new RegExp(company, 'i');
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }
    if (skill) query.skills = new RegExp(skill, 'i');
    if (mentorshipAvailable === 'true') query.mentorshipAvailable = true;
    if (willingToHire === 'true') query.willingToHire = true;

    const alumni = await Alumni.find(query)
      .populate('user', 'name email profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Alumni.countDocuments(query);

    res.json({
      success: true,
      data: alumni,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send connection request
// @route   POST /api/alumni/connections/request
// @access  Private
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;

    const requesterProfile = await Alumni.findOne({ user: req.user.id });
    
    if (!requesterProfile) {
      return res.status(400).json({ 
        message: 'You need to create your alumni profile before sending connection requests',
        code: 'NO_REQUESTER_PROFILE'
      });
    }

    const recipientProfile = await Alumni.findOne({ user: recipientId });
    
    if (!recipientProfile) {
      return res.status(404).json({ 
        message: 'Recipient alumni profile not found',
        code: 'NO_RECIPIENT_PROFILE'
      });
    }

    if (requesterProfile._id.toString() === recipientProfile._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check if connection already exists
    const existingConnection = await AlumniConnection.findOne({
      $or: [
        { requester: requesterProfile._id, recipient: recipientProfile._id },
        { requester: recipientProfile._id, recipient: requesterProfile._id }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }

    const connection = await AlumniConnection.create({
      requester: requesterProfile._id,
      recipient: recipientProfile._id,
      message
    });

    await connection.populate([
      { path: 'requester', populate: { path: 'user', select: 'name email profilePicture' } },
      { path: 'recipient', populate: { path: 'user', select: 'name email profilePicture' } }
    ]);

    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Respond to connection request
// @route   PUT /api/alumni/connections/:connectionId
// @access  Private
exports.respondToConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    const connection = await AlumniConnection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    const recipientProfile = await Alumni.findOne({ user: req.user.id });

    if (connection.recipient.toString() !== recipientProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: 'Connection request already processed' });
    }

    connection.status = status;
    await connection.save();

    await connection.populate([
      { path: 'requester', populate: { path: 'user', select: 'name email profilePicture' } },
      { path: 'recipient', populate: { path: 'user', select: 'name email profilePicture' } }
    ]);

    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my connections
// @route   GET /api/alumni/connections
// @access  Private
exports.getMyConnections = async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;

    const alumniProfile = await Alumni.findOne({ user: req.user.id });

    if (!alumniProfile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    const connections = await AlumniConnection.find({
      $or: [
        { requester: alumniProfile._id },
        { recipient: alumniProfile._id }
      ],
      status
    })
    .populate([
      { path: 'requester', populate: { path: 'user', select: 'name email profilePicture' } },
      { path: 'recipient', populate: { path: 'user', select: 'name email profilePicture' } }
    ])
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: connections,
      count: connections.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create alumni event
// @route   POST /api/alumni/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const alumniProfile = await Alumni.findOne({ user: req.user.id });

    if (!alumniProfile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    const event = await AlumniEvent.create({
      ...req.body,
      organizer: alumniProfile._id
    });

    await event.populate('organizer');

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get alumni events
// @route   GET /api/alumni/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const {
      eventType,
      status = 'published',
      upcoming = 'true',
      page = 1,
      limit = 10
    } = req.query;

    const query = { status };

    if (eventType) query.eventType = eventType;
    
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    const events = await AlumniEvent.find(query)
      .populate({
        path: 'organizer',
        populate: { path: 'user', select: 'name email profilePicture' }
      })
      .populate('attendees.alumni', 'user graduationYear major')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const count = await AlumniEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register for event
// @route   POST /api/alumni/events/:eventId/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const alumniProfile = await Alumni.findOne({ user: req.user.id });

    if (!alumniProfile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }

    const event = await AlumniEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check capacity
    if (event.capacity && event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.alumni.toString() === alumniProfile._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.attendees.push({ alumni: alumniProfile._id });
    await event.save();

    await event.populate([
      {
        path: 'organizer',
        populate: { path: 'user', select: 'name email profilePicture' }
      },
      {
        path: 'attendees.alumni',
        populate: { path: 'user', select: 'name email profilePicture' }
      }
    ]);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get alumni statistics
// @route   GET /api/alumni/stats
// @access  Private
exports.getAlumniStats = async (req, res) => {
  try {
    const totalAlumni = await Alumni.countDocuments();
    
    const alumniByYear = await Alumni.aggregate([
      {
        $group: {
          _id: '$graduationYear',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    const alumniByMajor = await Alumni.aggregate([
      {
        $group: {
          _id: '$major',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const alumniByIndustry = await Alumni.aggregate([
      {
        $match: { industry: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const mentorsAvailable = await Alumni.countDocuments({ mentorshipAvailable: true });
    const hiringAlumni = await Alumni.countDocuments({ willingToHire: true });

    res.json({
      success: true,
      data: {
        totalAlumni,
        alumniByYear,
        alumniByMajor,
        alumniByIndustry,
        mentorsAvailable,
        hiringAlumni
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
