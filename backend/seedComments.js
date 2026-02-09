import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

dotenv.config();

const seedComments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-media');
    console.log('MongoDB connected');

    const users = await User.find();
    const posts = await Post.find();
    if (users.length === 0 || posts.length === 0) {
      console.log('No users or posts found. Seed users and posts first.');
      process.exit(1);
    }

    // Sample comments for first post
    const comments = [
      { post: posts[0]._id, user: users[0]._id, text: 'Great project! Looking forward to seeing more.' },
      { post: posts[0]._id, user: users[0]._id, text: 'This is really inspiring. Good luck!' },
      { post: posts[1]._id, user: users[0]._id, text: 'Web development workshops are the best!' },
      { post: posts[2]._id, user: users[0]._id, text: 'Coffee and code is the perfect combo.' },
      { post: posts[3]._id, user: users[0]._id, text: 'Good luck with your goals this week!' },
      { post: posts[4]._id, user: users[0]._id, text: 'Consistency is key. Keep it up!' }
    ];

    await Comment.deleteMany({});
    const created = await Comment.insertMany(comments);
    console.log(`Seeded ${created.length} comments.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding comments:', err);
    process.exit(1);
  }
};

seedComments();
