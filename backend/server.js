const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database connection
let dbConnection;

const connectDB = async () => {
  try {
    dbConnection = await initDB();
    
    // Set the database connection globally so routes can access it
    app.set('dbConnection', dbConnection);
    
    // Import routes after database connection is established
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't exit, just use mock database
    dbConnection = { useMongoDB: false, mongoose: null };
    app.set('dbConnection', dbConnection);
    
    // Import routes with fallback to mock DB
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    
    console.log('Using file-based database as fallback');
  }
};

connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'College Media API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});