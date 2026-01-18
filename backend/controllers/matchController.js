const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');

/**
 * @desc    Create or update current user's mentor profile
 * @route   POST /api/tutor/mentor/profile
 * @access  Private
 */
exports.upsertMentorProfile = async (req, res) => {
    try {
        const { bio, skills, major, yearOfGraduation, availability, pricing } = req.body;

        let profile = await MentorProfile.findOne({ userId: req.user.id });

        if (profile) {
            // Update
            profile = await MentorProfile.findOneAndUpdate(
                { userId: req.user.id },
                { $set: { bio, skills, major, yearOfGraduation, availability, pricing } },
                { new: true, runValidators: true }
            );
        } else {
            // Create
            profile = await MentorProfile.create({
                userId: req.user.id,
                bio,
                skills,
                major,
                yearOfGraduation,
                availability,
                pricing
            });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get current user's mentor profile
 * @route   GET /api/tutor/mentor/profile/me
 * @access  Private
 */
exports.getMyMentorProfile = async (req, res) => {
    try {
        const profile = await MentorProfile.findOne({ userId: req.user.id });
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Find mentor matches for the current user
 * @route   GET /api/tutor/mentor/matches
 * @access  Private
 */
exports.getMentorMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Basic match logic: 
        // 1. Mentors in the same major
        // 2. Mentors with skills overlapping (optional if we had user skills)
        // 3. Excluding self

        // For now, let's just find mentors and rank them by major similarity and rating.
        const mentors = await MentorProfile.find({
            userId: { $ne: req.user.id },
            isActive: true
        })
            .populate('userId', 'username firstName lastName profilePicture')
            .lean();

        // Simple scoring
        const scoredMentors = mentors.map(mentor => {
            let score = 0;
            if (mentor.major === user.college) score += 50; // Using college as proxy for major if major not on User
            score += (mentor.rating.average * 10);
            return { ...mentor, matchScore: score };
        }).sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({ success: true, data: scoredMentors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get mentor by ID
 * @route   GET /api/tutor/mentor/:id
 * @access  Private
 */
exports.getMentorById = async (req, res) => {
    try {
        const mentor = await MentorProfile.findById(req.params.id)
            .populate('userId', 'username firstName lastName profilePicture bio');

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.status(200).json({ success: true, data: mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Book a session with a mentor
 * @route   POST /api/tutor/mentor/:id/book
 * @access  Private
 */
exports.bookSession = async (req, res) => {
    try {
        const { day, slotId } = req.body;
        const mentor = await MentorProfile.findById(req.params.id);

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        const availabilityDay = mentor.availability.find(a => a.day === day);
        if (!availabilityDay) {
            return res.status(400).json({ success: false, message: 'Invalid day' });
        }

        const slot = availabilityDay.slots.id(slotId);
        if (!slot || slot.isBooked) {
            return res.status(400).json({ success: false, message: 'Slot unavailable' });
        }

        slot.isBooked = true;
        await mentor.save();

        // In a real app, we'd create an Appointment/Order record here.
        res.status(200).json({ success: true, message: 'Session booked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
