import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Add the DATABASE_URL to .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...');

    console.log('👤 Creating users...');
    const saltRounds = 10;
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    const usersData = [
      { username: 'alex_campus', email: 'alex@college.edu', first: 'Alex', last: 'Rivera', bio: 'Computer Science | 2026' },
      { username: 'sarah_arts', email: 'sarah@college.edu', first: 'Sarah', last: 'Chen', bio: 'Digital Arts enthusiast 🎨' },
      { username: 'mike_sports', email: 'mike@college.edu', first: 'Mike', last: 'Johnson', bio: 'Varsity Basketball 🏀' },
      { username: 'emily_books', email: 'emily@college.edu', first: 'Emily', last: 'Davis', bio: 'Library dweller 📚' },
      { username: 'chris_tech', email: 'chris@college.edu', first: 'Chris', last: 'Patel', bio: 'Hackathon junkie 💻' },
    ];

    const createdUsers = [];

    for (const user of usersData) {
      const res = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, bio)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username`,
        [user.username, user.email, passwordHash, user.first, user.last, user.bio]
      );
      createdUsers.push(res.rows[0]);
    }

    console.log(`✅ Created ${createdUsers.length} users.`);

    console.log('📝 Creating posts...');
    const postsData = [
      { caption: 'Just finished my final project! 🚀 #cs #finals', type: 'image' },
      { caption: 'Sunset view from the library is unmatched today. 🌅', type: 'image' },
      { caption: 'Who is going to the game tonight? Let’s go tigers! 🐯', type: 'image' },
      { caption: 'Study group meeting at 5 PM in room 304. Everyone welcome!', type: 'image' },
      { caption: 'Found this cool cafe near campus. ☕ #coffee', type: 'image' },
      { caption: 'Can anyone recommend a good elective for next semester?', type: 'image' },
      { caption: 'Campus jazz band practice was intense. 🎷', type: 'video' },
      { caption: 'Lost my ID card near the gym. DM if found! 🆘', type: 'image' },
      { caption: 'Hackathon weekend starts now! Wish us luck.', type: 'image' },
      { caption: 'The cafeteria food is actually good today? 😲', type: 'image' },
      { caption: 'Beautiful fall colors on the quad. 🍂', type: 'image' },
      { caption: 'Selling my old textbooks. DM for prices. 📚', type: 'image' },
      { caption: 'First snow of the year! ❄️', type: 'video' },
      { caption: 'Does the library open 24/7 during finals week?', type: 'image' },
      { caption: 'Just joined the photography club! 📸', type: 'image' },
    ];

    for (const post of postsData) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      await client.query(
        `INSERT INTO posts (user_id, caption, content_type)
         VALUES ($1, $2, $3)`,
        [randomUser.id, post.caption, post.type]
      );
    }

    console.log(`✅ Created ${postsData.length} posts.`);
    console.log('🎉 Seeding completed successfully!');

  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();