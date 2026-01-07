const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/db');

// Load .env.local file
dotenv.config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  // Initialize database ONCE
  const dbConnection = await initDB();
  app.set('dbConnection', dbConnection);

  // Routes
  app.use('/api/v1/posts', require('./routes/posts'));
  app.use('/api/v1/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/uploads', express.static('uploads'));

  app.get('/', (req, res) => {
    res.json({ ok: true });
  });

  app.listen(5001, () => {
    console.log('🔥 BACKEND RUNNING ON 5001 🔥');
  });
};

startServer();
