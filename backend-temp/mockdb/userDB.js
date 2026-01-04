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
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Create new user object
  const newUser = {
    _id: Date.now().toString(), // Simple ID generation for mock
    ...userData,
    password: hashedPassword,
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

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  create,
  update,
  updateProfilePicture
};