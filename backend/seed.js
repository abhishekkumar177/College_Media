import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-media');
    console.log('MongoDB connected');

    // Clear existing posts (optional - comment out if you want to keep existing data)
    // await Post.deleteMany({});
    // console.log('Cleared existing posts');

    // Get all users to assign to posts
    const users = await User.find();
    
    // Create a sample user if none exists
    if (users.length === 0) {
      const user = await User.create({
        name: "Ayaan Shaikh",
        username: "ayaan",
        email: "ayaan@example.com",
        password: "$2a$10$7Qw8Qw8Qw8Qw8Qw8Qw8QwOQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8", // 'password' (bcrypt hash)
        role: "student",
        avatar: "https://ui-avatars.com/api/?name=Ayaan+Shaikh",
        bio: "Hello! I'm Ayaan."
      });
      console.log('Created sample user:', user);
      users.push(user);
    }

    if (users.length === 0) {
      console.log('No users found. Please create a user account first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s) in database`);

    // Sample posts
    const samplePosts = [
      {
        user: users[0]._id,
        content: 'Excited to share my latest project! 🚀 Working on a new social media platform that connects students worldwide. This platform will revolutionize how we collaborate and learn together. #Tech #Innovation #StudentLife',
        image: ''
      },
      {
        user: users[0]._id,
        content: 'Just finished an amazing workshop on web development! The key takeaway: never stop learning and always stay curious. What are you learning today? 💻✨',
        image: ''
      },
      {
        user: users[0]._id,
        content: 'Coffee + Code = Perfect day ☕👨‍💻 Currently working on implementing a comments feature with nested replies. It\'s challenging but so rewarding!',
        image: ''
      },
      {
        user: users[0]._id,
        content: 'New week, new goals! 🎯 This week I\'m focusing on: 1) Complete the social media features 2) Study for finals 3) Work on side projects. What are your goals this week?',
        image: ''
      },
      {
        user: users[0]._id,
        content: 'Shoutout to everyone balancing college and side projects! 🙌 Remember: consistency beats perfection. Keep pushing forward! #Motivation #StudentDeveloper',
        image: ''
      }
    ];

    // If there are multiple users, distribute posts among them
    if (users.length > 1) {
      samplePosts.forEach((post, index) => {
        post.user = users[index % users.length]._id;
      });
    }

    // Create posts
    const createdPosts = await Post.insertMany(samplePosts);
    console.log(`✅ Successfully created ${createdPosts.length} sample posts!`);

    // Display created posts
    createdPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post._id}`);
      console.log(`   Content: ${post.content.substring(0, 50)}...`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
