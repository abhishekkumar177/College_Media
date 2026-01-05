const express = require('express');
const cors = require('cors');

const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api/v1/posts', require('./routes/posts'));

app.use('/api/v1/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ ok: true });
});

app.listen(5001, () => {
  console.log('🔥 BACKEND RUNNING ON 5001 🔥');
});
