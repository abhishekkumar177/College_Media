# Messaging System Documentation

Version: 1.0.0  
Last Updated: January 10, 2026  
Authors: Backend & Frontend Teams  
Status: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Stories](#user-stories)
4. [Data Model](#data-model)
5. [API Specification](#api-specification)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Integration](#frontend-integration)
8. [Real-time Messaging](#real-time-messaging)
9. [Authentication & Authorization](#authentication--authorization)
10. [Validation & Sanitization](#validation--sanitization)
11. [Rate Limiting](#rate-limiting)
12. [File Attachments](#file-attachments)
13. [Read Receipts](#read-receipts)
14. [Conversation Management](#conversation-management)
15. [Message Lifecycle](#message-lifecycle)
16. [Security](#security)
17. [Performance Optimization](#performance-optimization)
18. [Testing Strategy](#testing-strategy)
19. [Monitoring & Logging](#monitoring--logging)
20. [Deployment](#deployment)
21. [Troubleshooting](#troubleshooting)
22. [Examples](#examples)
23. [Appendix](#appendix)

---

## 1. Overview

### 1.1 Purpose

The messaging system enables secure, real-time communication between users on the College Media platform. It supports one-on-one conversations with text messages, file attachments, read receipts, and conversation management.

### 1.2 Goals

- **Secure Communication**: End-to-end encryption over TLS with authentication
- **Real-time Delivery**: Instant message delivery when users are online
- **Scalable Architecture**: Support for thousands of concurrent users
- **Rich Features**: Text, images, files, read receipts, typing indicators
- **Cross-platform**: Works on web, mobile web, and future native apps
- **Offline Support**: Message queueing and synchronization
- **User Privacy**: Soft-delete, message retention, and data export

### 1.3 Non-Goals (Future Enhancements)

- Group messaging (planned for v2.0)
- Voice/video calls
- Message reactions and threads
- Client-side encryption (E2EE)
- Message forwarding
- Scheduled messages

### 1.4 Key Features

- Send and receive text messages
- Share images and files (up to 5MB)
- Conversation list with last message preview
- Unread message counts and badges
- Read receipts with timestamps
- Message search within conversations
- Soft delete (delete for me/everyone)
- Message pagination for long conversations
- Real-time typing indicators
- Online/offline status

---

## 2. Architecture

### 2.1 System Components

```
┌─────────────────┐
│   React Client  │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/WS
         ▼
┌─────────────────┐
│  Express.js API │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌──────────┐
│MongoDB │  │File-based│
│        │  │Mock DB   │
└────────┘  └──────────┘
```

### 2.2 Technology Stack

**Backend:**
- Node.js v18+
- Express.js 4.x
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- express-validator for validation
- Socket.io for real-time (optional)

**Frontend:**
- React 18+
- Axios for HTTP requests
- Context API for state management
- TailwindCSS for styling

### 2.3 Database Design

The system supports dual storage:

1. **MongoDB** (production): Scalable NoSQL with rich querying
2. **File-based Mock DB** (development): JSON files for local testing

### 2.4 Communication Flow

```
User A                 Server                 User B
  │                      │                      │
  ├──[1] Send Message───►│                      │
  │                      ├──[2] Validate        │
  │                      ├──[3] Store in DB     │
  │                      ├──[4] Emit WebSocket──►
  │◄─[5] Ack Response────┤                      │
  │                      │                      ├──[6] Receive
  │                      │◄─[7] Mark Read───────┤
  │◄─[8] Read Receipt────┤                      │
```

---

## 3. User Stories

### 3.1 Core Messaging

**As a user, I want to:**
- Send text messages to other users
- Receive messages in real-time
- See when my messages are delivered and read
- Delete messages I've sent
- Search through my message history

### 3.2 Conversation Management

**As a user, I want to:**
- View all my conversations in one place
- See the most recent message in each conversation
- Know how many unread messages I have
- Archive or mute conversations
- Search for specific conversations

### 3.3 Rich Media

**As a user, I want to:**
- Send images and files
- Preview images before sending
- Download files sent to me
- See upload progress

### 3.4 Privacy & Control

**As a user, I want to:**
- Delete messages for myself
- Block users from messaging me
- Report inappropriate messages
- Export my message history

---

## 4. Data Model

### 4.1 Message Schema (MongoDB)

```javascript
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  conversationId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});
```

### 4.2 Indexes

```javascript
// Compound indexes for performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });
```

### 4.3 Conversation ID Generation

To maintain consistent conversation IDs regardless of who initiates:

```javascript
// Static method on Message model
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};
```

### 4.4 Instance Methods

```javascript
// Mark message as read
messageSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Check if deleted for specific user
messageSchema.methods.isDeletedForUser = function(userId) {
  return this.deletedBy.some(id => id.toString() === userId.toString());
};
```

### 4.5 File-based Mock Database

```javascript
// mockdb/messageDB.js structure
{
  messages: [
    {
      _id: "unique-id",
      sender: "user-id-1",
      receiver: "user-id-2",
      content: "Hello!",
      messageType: "text",
      conversationId: "user-id-1_user-id-2",
      isRead: false,
      deletedBy: [],
      createdAt: "2026-01-10T10:00:00.000Z",
      updatedAt: "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

---

## 5. API Specification

### 5.1 Base URL

```
Production: https://api.college-media.com/api/messages
Development: http://localhost:5000/api/messages
```

### 5.2 Authentication

All endpoints require authentication via JWT token:

```
Authorization: Bearer <access_token>
```

### 5.3 Response Format

Standard response envelope:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### 5.4 Endpoints

#### 5.4.1 Send Message

**POST** `/api/messages`

**Description**: Send a new message to another user

**Request Body**:
```json
{
  "receiver": "user-id",
  "content": "Message text",
  "messageType": "text",
  "attachmentUrl": null
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "message-id",
    "sender": {
      "_id": "sender-id",
      "username": "alice",
      "firstName": "Alice",
      "profilePicture": "/uploads/alice.jpg"
    },
    "receiver": {
      "_id": "receiver-id",
      "username": "bob",
      "firstName": "Bob"
    },
    "content": "Message text",
    "conversationId": "sender-id_receiver-id",
    "isRead": false,
    "createdAt": "2026-01-10T10:00:00.000Z"
  },
  "message": "Message sent successfully"
}
```

**Errors**:
- `400`: Missing required fields or invalid data
- `401`: Unauthorized
- `404`: Receiver not found
- `429`: Rate limit exceeded

#### 5.4.2 Get Conversations

**GET** `/api/messages/conversations`

**Description**: Retrieve all conversations for authenticated user

**Query Parameters**:
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 50

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "user1_user2",
      "otherUser": {
        "_id": "user2",
        "username": "bob",
        "firstName": "Bob",
        "lastName": "Smith",
        "profilePicture": "/uploads/bob.jpg"
      },
      "lastMessage": {
        "_id": "msg-id",
        "content": "Last message text",
        "createdAt": "2026-01-10T10:00:00.000Z"
      },
      "unreadCount": 3
    }
  ],
  "message": "Conversations retrieved successfully"
}
```

#### 5.4.3 Get Conversation Messages

**GET** `/api/messages/conversation/:userId`

**Description**: Get all messages in a conversation with a specific user

**Path Parameters**:
- `userId`: The other user's ID

**Query Parameters**:
- `page` (optional): Page number, default 1
- `limit` (optional): Messages per page, default 50

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg-id",
        "sender": { /* user object */ },
        "receiver": { /* user object */ },
        "content": "Message text",
        "isRead": true,
        "readAt": "2026-01-10T10:05:00.000Z",
        "createdAt": "2026-01-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMessages": 243,
      "limit": 50
    }
  },
  "message": "Messages retrieved successfully"
}
```

#### 5.4.4 Mark Message as Read

**PUT** `/api/messages/:messageId/read`

**Description**: Mark a specific message as read

**Path Parameters**:
- `messageId`: The message ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "message-id",
    "isRead": true,
    "readAt": "2026-01-10T10:05:00.000Z"
  },
  "message": "Message marked as read"
}
```

**Errors**:
- `403`: Not authorized (only receiver can mark as read)
- `404`: Message not found

#### 5.4.5 Mark All Messages Read

**PUT** `/api/messages/conversation/:userId/read-all`

**Description**: Mark all messages in a conversation as read

**Path Parameters**:
- `userId`: The other user's ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "All messages marked as read"
}
```

#### 5.4.6 Delete Message

**DELETE** `/api/messages/:messageId`

**Description**: Soft-delete a message (hides from deleter's view)

**Path Parameters**:
- `messageId`: The message ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Message deleted successfully"
}
```

**Notes**:
- Message is soft-deleted for the requesting user
- When both users delete, message is permanently removed
- Only sender or receiver can delete

#### 5.4.7 Get Unread Count

**GET** `/api/messages/unread/count`

**Description**: Get total unread message count for authenticated user

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "unreadCount": 12
  },
  "message": "Unread count retrieved successfully"
}
```

---

## 6. Backend Implementation

### 6.1 Project Structure

```
backend/
├── models/
│   └── Message.js          # Message Mongoose model
├── routes/
│   └── messages.js         # Message route handlers
├── middleware/
│   └── validationMiddleware.js  # Input validation
├── mockdb/
│   ├── messageDB.js        # Mock database implementation
│   └── messages.json       # JSON storage file
└── server.js               # Main server file
```

### 6.2 Route Handler Example

```javascript
// routes/messages.js
const express = require('express');
const router = express.Router();
const MessageMongo = require('../models/Message');
const MessageMock = require('../mockdb/messageDB');

// Verify JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Send message endpoint
router.post('/', verifyToken, validateMessage, async (req, res) => {
  try {
    const { receiver, content, messageType } = req.body;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Validate receiver exists
    const receiverUser = useMongoDB 
      ? await UserMongo.findById(receiver)
      : await UserMock.findById(receiver);
    
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Prevent self-messaging
    if (receiver === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Create message
    const messageData = {
      sender: req.userId,
      receiver,
      content,
      messageType: messageType || 'text'
    };

    let message;
    if (useMongoDB) {
      const conversationId = MessageMongo.generateConversationId(
        req.userId, 
        receiver
      );
      message = await MessageMongo.create({
        ...messageData,
        conversationId
      });
      await message.populate('sender receiver', 
        'username firstName lastName profilePicture'
      );
    } else {
      message = await MessageMock.create(messageData);
    }

    // Emit real-time event (if Socket.io configured)
    // io.to(receiver).emit('message:new', message);

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});
```

### 6.3 Validation Middleware

```javascript
// middleware/validationMiddleware.js
const { body, param } = require('express-validator');

const validateMessage = [
  body('receiver')
    .notEmpty()
    .withMessage('Receiver is required')
    .isString()
    .withMessage('Invalid receiver ID'),
  
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be 1-2000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
  
  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Invalid attachment URL')
];

const validateMessageId = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
];
```

### 6.4 Mock Database Implementation

```javascript
// mockdb/messageDB.js
const fs = require('fs');
const path = require('path');

class MessageMock {
  constructor() {
    this.filePath = path.join(__dirname, 'messages.json');
    this.messages = this._load();
  }

  _load() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  _save() {
    fs.writeFileSync(
      this.filePath, 
      JSON.stringify(this.messages, null, 2)
    );
  }

  _generateId() {
    return Date.now().toString() + 
           Math.random().toString(36).substr(2, 9);
  }

  static generateConversationId(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  async create(messageData) {
    const message = {
      _id: this._generateId(),
      ...messageData,
      conversationId: MessageMock.generateConversationId(
        messageData.sender,
        messageData.receiver
      ),
      isRead: false,
      readAt: null,
      deletedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.messages.push(message);
    this._save();
    return message;
  }

  async find(query = {}) {
    return this.messages.filter(msg => {
      if (query.conversationId && 
          msg.conversationId !== query.conversationId) {
        return false;
      }
      if (query.sender && msg.sender !== query.sender) {
        return false;
      }
      if (query.receiver && msg.receiver !== query.receiver) {
        return false;
      }
      return true;
    });
  }

  async findById(id) {
    return this.messages.find(msg => msg._id === id);
  }

  async updateOne(query, update) {
    const index = this.messages.findIndex(
      msg => msg._id === query._id
    );
    
    if (index === -1) return { modifiedCount: 0 };

    if (update.$set) {
      this.messages[index] = {
        ...this.messages[index],
        ...update.$set,
        updatedAt: new Date().toISOString()
      };
    }

    if (update.$push) {
      Object.keys(update.$push).forEach(key => {
        if (!Array.isArray(this.messages[index][key])) {
          this.messages[index][key] = [];
        }
        this.messages[index][key].push(update.$push[key]);
      });
    }

    this._save();
    return { modifiedCount: 1 };
  }
}

module.exports = new MessageMock();
```

---

## 7. Frontend Integration

### 7.1 API Service

```javascript
// api/endpoints.js
export const messagesApi = {
  send: (data) => 
    apiClient.post('/messages', data),
  
  getConversations: (params) => 
    apiClient.get('/messages/conversations', { params }),
  
  getConversation: (userId, params) => 
    apiClient.get(`/messages/conversation/${userId}`, { params }),
  
  markAsRead: (messageId) => 
    apiClient.put(`/messages/${messageId}/read`),
  
  markAllAsRead: (userId) => 
    apiClient.put(`/messages/conversation/${userId}/read-all`),
  
  delete: (messageId) => 
    apiClient.delete(`/messages/${messageId}`),
  
  getUnreadCount: () => 
    apiClient.get('/messages/unread/count')
};
```

### 7.2 React Component

```jsx
// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../api/endpoints';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversation(userId);
      if (response.data.success) {
        setMessages(response.data.data.messages.reverse());
        await messagesApi.markAllAsRead(userId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const response = await messagesApi.send({
        receiver: activeConversationId,
        content: messageInput.trim(),
        messageType: 'text'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data]);
        setMessageInput('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversations list */}
      <div className="w-1/3 border-r">
        {conversations.map(conv => (
          <div
            key={conv.conversationId}
            onClick={() => setActiveConversationId(
              conv.otherUserId || conv.otherUser?._id
            )}
            className="p-4 cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">
              {conv.otherUser?.firstName} {conv.otherUser?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage?.content}
            </p>
            {conv.unreadCount > 0 && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                {conv.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`mb-4 ${
                msg.sender === currentUserId 
                  ? 'text-right' 
                  : 'text-left'
              }`}
            >
              <div className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg">
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-2 border rounded-full"
          />
        </form>
      </div>
    </div>
  );
}
```

---

## 8. Real-time Messaging

### 8.1 Socket.io Server Setup

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Join user's personal room
  socket.join(socket.userId);
  
  // Notify user is online
  socket.broadcast.emit('user:online', socket.userId);
  
  // Handle typing indicator
  socket.on('typing:start', (receiverId) => {
    io.to(receiverId).emit('typing:start', socket.userId);
  });
  
  socket.on('typing:stop', (receiverId) => {
    io.to(receiverId).emit('typing:stop', socket.userId);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    socket.broadcast.emit('user:offline', socket.userId);
  });
});

// Emit message to recipient
function emitMessage(receiverId, message) {
  io.to(receiverId).emit('message:new', message);
}

module.exports = { app, server, io, emitMessage };
```

### 8.2 Socket.io Client Integration

```javascript
// services/socket.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('message:new', (message) => {
      // Handle new message
      this.handleNewMessage(message);
    });

    this.socket.on('typing:start', (userId) => {
      // Show typing indicator
      this.handleTypingStart(userId);
    });
  }

  sendTypingStart(receiverId) {
    this.socket?.emit('typing:start', receiverId);
  }

  sendTypingStop(receiverId) {
    this.socket?.emit('typing:stop', receiverId);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
```

---

## 9. Authentication & Authorization

### 9.1 JWT Token Structure

```json
{
  "userId": "user-id-123",
  "username": "alice",
  "email": "alice@college.edu",
  "iat": 1704902400,
  "exp": 1704988800
}
```

### 9.2 Authorization Rules

- Users can only send messages to valid, active users
- Users cannot send messages to themselves
- Only message sender or receiver can delete messages
- Only message receiver can mark messages as read
- Admin users have additional privileges (audit, moderation)

### 9.3 Token Verification Middleware

```javascript
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

---

## 10. Validation & Sanitization

### 10.1 Input Validation Rules

**Message Content:**
- Required field
- Minimum 1 character
- Maximum 2000 characters
- Trim whitespace
- Sanitize HTML/script tags

**Receiver ID:**
- Required field
- Valid user ID format
- User must exist
- User must not be blocked

**Message Type:**
- Optional field
- Must be one of: 'text', 'image', 'file'
- Default: 'text'

**Attachment URL:**
- Optional field
- Must be valid URL
- Must point to allowed storage domain

### 10.2 Sanitization Functions

```javascript
const sanitizeContent = (content) => {
  // Remove HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '');
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'college-media-uploads.s3.amazonaws.com',
      'cdn.college-media.com'
    ];
    
    return allowedDomains.some(domain => 
      parsed.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
};
```

---

## 11. Rate Limiting

### 11.1 Rate Limit Tiers

**Per-IP Limits:**
- 100 requests per 10 minutes (general)
- 20 message sends per minute

**Per-User Limits:**
- 50 messages per hour
- 10 messages per minute to same recipient
- 5 file uploads per hour

### 11.2 Implementation

```javascript
const rateLimit = require('express-rate-limit');

// General message endpoint limiter
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  keyGenerator: (req) => req.userId || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
});

// Apply to routes
app.use('/api/messages', messageLimiter);
```

### 11.3 Redis-based Rate Limiting

```javascript
const Redis = require('ioredis');
const redis = new Redis();

async function checkRateLimit(userId, action, limit, window) {
  const key = `ratelimit:${action}:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    throw new Error('Rate limit exceeded');
  }
  
  return current;
}
```

---

## 12. File Attachments

### 12.1 Upload Flow

```
Client                Server              Storage
  │                     │                    │
  ├─[1] Request Upload─►│                    │
  │                     ├─[2] Generate URL──►│
  │◄─[3] Signed URL─────┤                    │
  ├────[4] Upload File──────────────────────►│
  │                     │                    │
  ├─[5] Send Message───►│                    │
  │   with URL          │                    │
```

### 12.2 File Validation

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### 12.3 S3 Upload Example

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function uploadToS3(file) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `messages/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}
```

---

## 13. Read Receipts

### 13.1 Read Status Tracking

Messages have two read-related fields:
- `isRead`: Boolean flag
- `readAt`: Timestamp when marked as read

### 13.2 Mark as Read Logic

```javascript
// Automatic read on view
async function markConversationAsRead(userId, otherUserId) {
  const conversationId = generateConversationId(userId, otherUserId);
  
  await Message.updateMany(
    {
      conversationId,
      receiver: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  // Emit read receipt to sender
  io.to(otherUserId).emit('messages:read', {
    conversationId,
    readAt: new Date()
  });
}
```

### 13.3 Read Receipt UI

```jsx
function MessageItem({ message, isSentByMe }) {
  return (
    <div className={isSentByMe ? 'text-right' : 'text-left'}>
      <div className="message-bubble">
        {message.content}
      </div>
      {isSentByMe && (
        <div className="text-xs text-gray-500">
          {message.isRead ? (
            <span>✓✓ Read {formatTime(message.readAt)}</span>
          ) : (
            <span>✓ Sent</span>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 14. Conversation Management

### 14.1 Conversation List Query

```javascript
async function getConversations(userId) {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { receiver: mongoose.Types.ObjectId(userId) }
        ],
        deletedBy: { $nin: [mongoose.Types.ObjectId(userId)] }
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { 'lastMessage.createdAt': -1 } }
  ]);

  return messages;
}
```

### 14.2 Archive Conversation

```javascript
// Add archived field to user preferences
const userPreferencesSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User' },
  archivedConversations: [String]
});

async function archiveConversation(userId, conversationId) {
  await UserPreferences.findOneAndUpdate(
    { userId },
    { $addToSet: { archivedConversations: conversationId } },
    { upsert: true }
  );
}
```

---

## 15. Message Lifecycle

### 15.1 State Diagram

```
         ┌─────────┐
         │ Drafted │ (Client-side only)
         └────┬────┘
              │
              ▼
         ┌─────────┐
         │  Sent   │
         └────┬────┘
              │
              ▼
       ┌─────────────┐
       │  Delivered  │ (Real-time)
       └──────┬──────┘
              │
              ▼
         ┌─────────┐
         │  Read   │
         └────┬────┘
              │
              ▼
       ┌─────────────┐
       │   Deleted   │ (Soft)
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │   Purged    │ (Permanent)
       └─────────────┘
```

### 15.2 Lifecycle Events

1. **Draft**: User typing (client-side state)
2. **Sent**: Message persisted to database
3. **Delivered**: Recipient's device acknowledges receipt
4. **Read**: Recipient views message
5. **Deleted**: User soft-deletes message
6. **Purged**: Permanent deletion after retention period

---

## 16. Security

### 16.1 Security Checklist

- [x] TLS/SSL encryption in transit
- [x] JWT authentication on all endpoints
- [x] Input validation and sanitization
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (content sanitization)
- [x] CSRF protection
- [x] Rate limiting
- [x] File upload validation
- [x] Malware scanning for uploads
- [x] Audit logging
- [x] Error message sanitization (no sensitive data)

### 16.2 Content Security Policy

```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.API_URL]
  }
}));
```

### 16.3 Sensitive Data Handling

**Never log:**
- Message content
- Attachment contents
- Authentication tokens (only hash)
- User passwords

**Always log:**
- User IDs
- Timestamps
- IP addresses (hashed for privacy)
- Action types
- Error codes (not messages)

---

## 17. Performance Optimization

### 17.1 Database Indexing

```javascript
// Essential indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Compound index for common query
messageSchema.index({ 
  conversationId: 1, 
  deletedBy: 1, 
  createdAt: -1 
});
```

### 17.2 Caching Strategy

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Cache conversation list
async function getCachedConversations(userId) {
  const cacheKey = `conversations:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const conversations = await fetchConversationsFromDB(userId);
  await redis.setex(cacheKey, 30, JSON.stringify(conversations));
  
  return conversations;
}

// Invalidate cache on new message
async function invalidateConversationCache(userId) {
  await redis.del(`conversations:${userId}`);
}
```

### 17.3 Pagination Best Practices

```javascript
// Cursor-based pagination for better performance
async function getMessagesPaginated(conversationId, cursor, limit = 50) {
  const query = { conversationId };
  
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }
  
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  
  const nextCursor = messages.length === limit
    ? messages[messages.length - 1].createdAt
    : null;
  
  return { messages, nextCursor };
}
```

### 17.4 Connection Pooling

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

---

## 18. Testing Strategy

### 18.1 Unit Tests

```javascript
// tests/unit/message.test.js
const Message = require('../../models/Message');

describe('Message Model', () => {
  it('should generate consistent conversation ID', () => {
    const id1 = Message.generateConversationId('user1', 'user2');
    const id2 = Message.generateConversationId('user2', 'user1');
    expect(id1).toBe(id2);
  });

  it('should mark message as read', async () => {
    const message = new Message({
      sender: 'user1',
      receiver: 'user2',
      content: 'Test',
      conversationId: 'user1_user2'
    });
    
    await message.markAsRead();
    expect(message.isRead).toBe(true);
    expect(message.readAt).toBeDefined();
  });
});
```

### 18.2 Integration Tests

```javascript
// tests/integration/messages.test.js
const request = require('supertest');
const app = require('../../server');

describe('POST /api/messages', () => {
  let token;
  
  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    token = response.body.data.token;
  });

  it('should send a message', async () => {
    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiver: 'receiverId',
        content: 'Hello!',
        messageType: 'text'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.content).toBe('Hello!');
  });

  it('should reject self-messaging', async () => {
    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiver: 'sameUserId',
        content: 'Hello me!'
      });
    
    expect(response.status).toBe(400);
  });
});
```

### 18.3 E2E Tests

```javascript
// tests/e2e/messaging.test.js
const { chromium } = require('playwright');

describe('Messaging E2E', () => {
  let browser, page;
  
  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    // Login
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  it('should send and receive message', async () => {
    await page.goto('http://localhost:3000/messages');
    
    // Select conversation
    await page.click('.conversation-item:first-child');
    
    // Type and send message
    await page.fill('[placeholder="Type a message..."]', 'Test message');
    await page.click('button[type="submit"]');
    
    // Verify message appears
    const message = await page.waitForSelector('.message-bubble:last-child');
    const text = await message.textContent();
    expect(text).toBe('Test message');
  });

  afterAll(async () => {
    await browser.close();
  });
});
```

### 18.4 Load Testing

```javascript
// tests/load/messages.load.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up
    { duration: '3m', target: 100 }, // Steady
    { duration: '1m', target: 0 }    // Ramp down
  ]
};

export default function() {
  const payload = JSON.stringify({
    receiver: 'test-receiver-id',
    content: 'Load test message'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`
    }
  };

  const res = http.post(
    'http://localhost:5000/api/messages',
    payload,
    params
  );

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
```

---

## 19. Monitoring & Logging

### 19.1 Metrics to Track

**Application Metrics:**
- Messages sent per minute
- Messages delivered per minute
- Average message send latency
- Failed message attempts
- WebSocket connections
- Unread message count (aggregate)

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Database connections
- Query latency
- Network I/O
- Disk I/O

### 19.2 Logging Configuration

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Log message events
logger.info('Message sent', {
  userId: req.userId,
  messageId: message._id,
  receiverId: message.receiver,
  conversationId: message.conversationId,
  type: message.messageType,
  ip: req.ip
});
```

### 19.3 Prometheus Metrics

```javascript
const promClient = require('prom-client');

const messagesSent = new promClient.Counter({
  name: 'messages_sent_total',
  help: 'Total number of messages sent',
  labelNames: ['status']
});

const messageSendDuration = new promClient.Histogram({
  name: 'message_send_duration_seconds',
  help: 'Message send duration',
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Usage
messagesSent.inc({ status: 'success' });
messageSendDuration.observe(duration);
```

### 19.4 Health Check Endpoint

```javascript
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {}
  };

  // Check database
  try {
    await mongoose.connection.db.admin().ping();
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## 20. Deployment

### 20.1 Environment Variables

```bash
# .env.example
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/college-media
MONGO_POOL_SIZE=10

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# CORS
CLIENT_URL=http://localhost:3000
```

### 20.2 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/college-media
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

### 20.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy commands here
```

---

## 21. Troubleshooting

### 21.1 Common Issues

**Issue: Messages not sending**

**Symptoms**: 500 error on POST /api/messages

**Diagnosis**:
1. Check server logs for exceptions
2. Verify database connectivity
3. Check authentication token validity
4. Verify receiver user exists

**Solution**:
```bash
# Check logs
tail -f logs/error.log

# Test database connection
mongosh --eval "db.adminCommand('ping')"

# Verify JWT token
jwt decode <token>
```

**Issue: Real-time messages not received**

**Symptoms**: WebSocket connected but events not firing

**Diagnosis**:
1. Check Socket.io connection status
2. Verify room joining
3. Check event emission in server logs

**Solution**:
```javascript
// Add debug logging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.userId);
  console.log('Rooms:', socket.rooms);
});
```

**Issue: High latency**

**Symptoms**: Slow message send/receive

**Diagnosis**:
1. Check database query performance
2. Review indexes
3. Monitor CPU/memory usage

**Solution**:
```javascript
// Add query profiling
mongoose.set('debug', true);

// Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### 21.2 Debug Mode

```javascript
// Enable debug logging
process.env.DEBUG = 'messages:*';

const debug = require('debug')('messages:controller');

debug('Sending message from %s to %s', senderId, receiverId);
```

---

## 22. Examples

### 22.1 Send Message (cURL)

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver": "60d5ec49f1b2c8b1f8e4e1a1",
    "content": "Hello from cURL!",
    "messageType": "text"
  }'
```

### 22.2 Get Conversations (cURL)

```bash
curl -X GET http://localhost:5000/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 22.3 Node.js Client Example

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const token = 'YOUR_TOKEN';

async function sendMessage(receiverId, content) {
  try {
    const response = await axios.post(
      `${API_URL}/messages`,
      {
        receiver: receiverId,
        content,
        messageType: 'text'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

sendMessage('60d5ec49f1b2c8b1f8e4e1a1', 'Hello!');
```

---

## 23. Appendix

### 23.1 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| MSG_001 | Receiver not found | Target user does not exist |
| MSG_002 | Self-messaging not allowed | Cannot send to yourself |
| MSG_003 | Message too long | Content exceeds 2000 chars |
| MSG_004 | Invalid message type | Type not in allowed list |
| MSG_005 | Message not found | Message ID invalid |
| MSG_006 | Not authorized | User cannot access resource |
| MSG_007 | Rate limit exceeded | Too many requests |

### 23.2 Database Queries Reference

**Get unread count:**
```javascript
Message.countDocuments({
  receiver: userId,
  isRead: false,
  deletedBy: { $nin: [userId] }
});
```

**Get recent conversations:**
```javascript
Message.aggregate([
  {
    $match: {
      $or: [{ sender: userId }, { receiver: userId }]
    }
  },
  { $sort: { createdAt: -1 } },
  {
    $group: {
      _id: '$conversationId',
      lastMessage: { $first: '$$ROOT' }
    }
  }
]);
```

### 23.3 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/best-practices/)

### 23.4 Change Log

- **v1.0.0** (2026-01-10): Initial release
  - Basic messaging functionality
  - Conversation management
  - Read receipts
  - File attachments
  - Real-time support

### 23.5 Future Roadmap

- **v1.1.0**: Group messaging
- **v1.2.0**: Voice messages
- **v1.3.0**: Video calls
- **v2.0.0**: End-to-end encryption

---

## Contact & Support

**Development Team**: dev-team@college-media.com  
**Security Issues**: security@college-media.com  
**Documentation**: docs@college-media.com

For bugs and feature requests, please open an issue on GitHub.

---

**End of Documentation**
