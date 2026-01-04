const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validationMiddleware');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Register a new user
router.post('/register', validateRegister, checkValidation, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const existingUser = await UserMongo.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'User with this email or username already exists' 
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new UserMongo({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          token
        },
        message: 'User registered successfully'
      });
    } else {
      // Use mock database
      try {
        const newUser = await UserMock.create({
          username,
          email,
          password, // password will be hashed in the create function
          firstName,
          lastName
        });

        // Generate JWT token
        const token = jwt.sign(
          { userId: newUser._id },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          success: true,
          data: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            token
          },
          message: 'User registered successfully'
        });
      } catch (error) {
        if (error.message.includes('already exists')) {
          return res.status(400).json({ 
            success: false,
            data: null,
            message: error.message 
          });
        }
        throw error; // Re-throw other errors
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(error); // Pass to error handler
  }
});

// Login user
router.post('/login', validateLogin, checkValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const user = await UserMongo.findOne({ email });
      if (!user) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token
        },
        message: 'Login successful'
      });
    } else {
      // Use mock database
      const user = await UserMock.findByEmail(email);
      if (!user) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token
        },
        message: 'Login successful'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error); // Pass to error handler
  }
});

module.exports = router;
