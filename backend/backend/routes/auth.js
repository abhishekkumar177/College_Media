const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// jwt token implemented
const router = express.Router(); // 🔥 THIS WAS MISSING

// TEST ROUTE
router.get('/test', (req, res) => {
  res.json({ ok: true });
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try{
    // require email and password
    const {email,password}=req.body;

    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:'Please provide email and password'
      });
    }

    // find user by email
    const user=await User.findOne({email});

    if(!user ||!user.isActive ){
      return res.status(401).json({
        success:false,
        message:'Invalid credentials'
      });
    }

    // compare password
    const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch){
      return res.status(401).json({
        success:false,
        message:'Invalid credentials'
      });
    }
    // update last login
    user.lastLogin=new Date();
    await user.save();

    // generate token
    const token=jwt.sign(
      {
        userId:user._id,
        role:user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {expiresIn:'7d'}
    );

    res.json({
      success:true,
      token,
      data:{
        id:user.id,
        email:user.email,
        username:user.username,
        role:user.role
      }
    });
        
  } catch(err){
    res.status(500).json({
      success:false,
      message:'Login failed. Please try again.'
    });
  }

});

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, username, and password' 
      });
    }

    //  check if user already exists
    const existingUser=await User.findOne({
      $or:[{email},{username}]
    });

    if(existingUser){
      return res.status(400).json({
        success:false,
        message:'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

  //  create user
  const newUser=new User({
    username,
    email,
    password:hashedPassword,
    firstName,
    lastName
  });
  
    // 🔥 CRITICAL: Save user to database
    await newUser.save();
  
    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
});

module.exports = router;
