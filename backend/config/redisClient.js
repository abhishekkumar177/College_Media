const { createClient } = require('redis');

let redisClient = null;

if (process.env.REDIS_URL || process.env.USE_REDIS === 'true') {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      console.log('⚠️ Rate limiting will fall back to memory store');
    });

    redisClient.connect().then(() => {
      console.log('✅ Redis connected successfully');
    }).catch((err) => {
      console.error('❌ Redis connection failed:', err.message);
      console.log('⚠️ Rate limiting will use memory store');
      redisClient = null;
    });
  } catch (err) {
    console.error('❌ Redis initialization failed:', err.message);
    console.log('⚠️ Rate limiting will use memory store');
    redisClient = null;
  }
} else {
  console.log('ℹ️ Redis not configured. Using memory store for rate limiting.');
}

module.exports = redisClient;
