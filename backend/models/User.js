import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'moderator', 'user'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);