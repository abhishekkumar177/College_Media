const mongoose = require('mongoose');
const fs = require('fs');

// Check if MongoDB is available by attempting to connect with a timeout
let useMongoDB = true;

// Function to initialize database connection
const initDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_media';
  
  // Try to connect to MongoDB
  try {
    // Attempt connection with a timeout
    const connectPromise = new Promise((resolve, reject) => {
      const conn = mongoose.connect(MONGODB_URI, {
        // Remove deprecated options for newer versions
      });
      
      conn.then(resolve).catch(reject);
    });
    
    // Set a timeout for the connection attempt
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 3000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('MongoDB connected successfully');
    useMongoDB = true;
    return { useMongoDB: true, mongoose };
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
    console.log('Falling back to file-based database for development');
    useMongoDB = false;
    return { useMongoDB: false, mongoose: null };
  }
};

module.exports = { initDB, useMongoDB };