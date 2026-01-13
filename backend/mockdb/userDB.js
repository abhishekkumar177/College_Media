const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'users.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper function to read users from file
const readUsers = () => {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper function to write users to file
const writeUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

// Find user by email
const findByEmail = (email) => {
  const users = readUsers();
  return users.find(user => user.email === email);
};

// Find user by username
const findByUsername = (username) => {
  const users = readUsers();
  return users.find(user => user.username === username);
};

// Find user by ID
const findById = (id) => {
  const users = readUsers();
  return users.find(user => user._id === id);
};

// Create a new user
const create = async (userData) => {
  const users = readUsers();
  
  // Check if user already exists
  if (findByEmail(userData.email) || findByUsername(userData.username)) {
    throw new Error('User with this email or username already exists');
  }
  
  // Create new user object (password should already be hashed from auth route)
  const newUser = {
    _id: Date.now().toString(), // Simple ID generation for mock
    ...userData,
    isActive: true,
    isVerified: false,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  
  // Return user object without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Update a user
const update = (id, updateData) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  writeUsers(users);
  
  // Return user object without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

// Update profile picture
const updateProfilePicture = (id, profilePicturePath) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].profilePicture = profilePicturePath;
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  // Return user object without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

// Update password
const updatePassword = (id, hashedPassword) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].password = hashedPassword;
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Deactivate user account
const deactivate = (id) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].isActive = false;
  users[userIndex].deactivatedAt = new Date().toISOString();
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Reactivate user account
const reactivate = (id) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].isActive = true;
  users[userIndex].deactivatedAt = null;
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Soft delete user account
const softDelete = (id, reason = null) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].isDeleted = true;
  users[userIndex].deletedAt = new Date().toISOString();
  users[userIndex].deletionReason = reason;
  users[userIndex].isActive = false;
  users[userIndex].scheduledDeletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Restore deleted account
const restore = (id) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].isDeleted = false;
  users[userIndex].deletedAt = null;
  users[userIndex].deletionReason = null;
  users[userIndex].scheduledDeletionDate = null;
  users[userIndex].isActive = true;
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Permanently delete user account
const permanentDelete = (id) => {
  const users = readUsers();
  const filteredUsers = users.filter(user => user._id !== id);
  
  if (users.length === filteredUsers.length) {
    return null; // User not found
  }
  
  writeUsers(filteredUsers);
  
  return true;
};

// Update one field (generic update method)
const updateOne = (query, updateData) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === query._id);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Apply updates
  Object.keys(updateData).forEach(key => {
    users[userIndex][key] = updateData[key];
  });
  
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return true;
};

// Block a user
const blockUser = (userId, userIdToBlock) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Initialize blockedUsers array if it doesn't exist
  if (!users[userIndex].blockedUsers) {
    users[userIndex].blockedUsers = [];
  }
  
  // Add to blocked list if not already blocked
  if (!users[userIndex].blockedUsers.includes(userIdToBlock)) {
    users[userIndex].blockedUsers.push(userIdToBlock);
    
    // Remove from followers/following if exists
    if (users[userIndex].followers) {
      users[userIndex].followers = users[userIndex].followers.filter(id => id !== userIdToBlock);
    }
    if (users[userIndex].following) {
      users[userIndex].following = users[userIndex].following.filter(id => id !== userIdToBlock);
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    writeUsers(users);
  }
  
  return users[userIndex];
};

// Unblock a user
const unblockUser = (userId, userIdToUnblock) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Initialize blockedUsers array if it doesn't exist
  if (!users[userIndex].blockedUsers) {
    users[userIndex].blockedUsers = [];
  }
  
  // Remove from blocked list
  users[userIndex].blockedUsers = users[userIndex].blockedUsers.filter(id => id !== userIdToUnblock);
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return users[userIndex];
};

// Check if user is blocked
const isUserBlocked = (userId, targetUserId) => {
  const user = findById(userId);
  
  if (!user || !user.blockedUsers) {
    return false;
  }
  
  return user.blockedUsers.includes(targetUserId);
};

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  create,
  update,
  updateProfilePicture,
  updatePassword,
  deactivate,
  reactivate,
  softDelete,
  restore,
  permanentDelete,
  updateOne,
  blockUser,
  unblockUser,
  isUserBlocked
};