const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-media')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
// app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ message: 'College Media Backend Running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});