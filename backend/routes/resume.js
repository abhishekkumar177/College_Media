const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Resume = require('../models/Resume');
const ResumeReview = require('../models/ResumeReview');

const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/resume
// @desc    Create or Update Resume (Student)
// @access  Private (Student)
router.post('/', protect, async (req, res) => {
  try {
    const { 
      experience, 
      education, 
      skills, 
      projects,
      fileUrl, 
      status
    } = req.body;

    const resumeFields = {
      student: req.user.id,
      content: {
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        projects: projects || []
      },
      fileUrl: fileUrl || null,
      status: status || 'draft'
    };

    let resume = await Resume.findOneAndUpdate(
      { student: req.user.id },
      { $set: resumeFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Resume saved successfully',
      data: resume
    });

  } catch (err) {
    console.error('Error saving resume:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/resume/feed
// @desc    Get resumes needing review (Alumni Only)
// @access  Private (Alumni)
router.get('/feed', protect, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ success: false, message: 'Access denied. Alumni only.' });
    }

    const resumes = await Resume.find({ status: 'submitted' })
      .populate('student', ['username', 'firstName', 'lastName', 'profilePicture', 'bio'])
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes
    });

  } catch (err) {
    console.error('Error fetching resume feed:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/resume/:id/review
// @desc    Submit a review (Alumni Only)
// @access  Private (Alumni)
router.post('/:id/review', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (req.user.role !== 'alumni') {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Access denied. Alumni only.' });
    }

    const { comments, rating, suggestions } = req.body;
    const resumeId = req.params.id;

    const resume = await Resume.findById(resumeId).session(session);
    if (!resume) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const newReview = new ResumeReview({
      resume: resumeId,
      reviewer: req.user.id,
      comments,
      rating,
      suggestions: suggestions || []
    });

    await newReview.save({ session });

    resume.status = 'reviewed';
    resume.assignedAlumni = req.user.id;
    await resume.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: newReview
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Error submitting review:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    session.endSession();
  }
});

module.exports = router;