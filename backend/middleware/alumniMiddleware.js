const Alumni = require('../models/Alumni');

// Middleware to check if user has an alumni profile
exports.requireAlumniProfile = async (req, res, next) => {
  try {
    const alumniProfile = await Alumni.findOne({ user: req.user.id });
    
    if (!alumniProfile) {
      return res.status(403).json({ 
        message: 'Alumni profile required. Please create your alumni profile first.' 
      });
    }
    
    req.alumniProfile = alumniProfile;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware to check if alumni profile is verified
exports.requireVerifiedAlumni = async (req, res, next) => {
  try {
    const alumniProfile = await Alumni.findOne({ user: req.user.id });
    
    if (!alumniProfile) {
      return res.status(403).json({ 
        message: 'Alumni profile required' 
      });
    }
    
    if (!alumniProfile.verified) {
      return res.status(403).json({ 
        message: 'Your alumni profile must be verified to access this resource' 
      });
    }
    
    req.alumniProfile = alumniProfile;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware to check if user is event organizer
exports.isEventOrganizer = (model) => {
  return async (req, res, next) => {
    try {
      const Event = require(`../models/${model}`);
      const event = await Event.findById(req.params.eventId || req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const alumniProfile = await Alumni.findOne({ user: req.user.id });
      
      if (event.organizer.toString() !== alumniProfile._id.toString()) {
        return res.status(403).json({ 
          message: 'Only the event organizer can perform this action' 
        });
      }
      
      req.event = event;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};
