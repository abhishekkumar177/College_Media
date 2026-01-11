const fs = require('fs');
const path = require('path');

const messagesFilePath = path.join(__dirname, 'messages.json');

// Initialize messages file if it doesn't exist
if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([], null, 2));
}

class MessageMock {
  constructor() {
    this.messages = this._loadMessages();
  }

  _loadMessages() {
    try {
      const data = fs.readFileSync(messagesFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  _saveMessages() {
    try {
      fs.writeFileSync(messagesFilePath, JSON.stringify(this.messages, null, 2));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  _generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  static generateConversationId(userId1, userId2) {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  async create(messageData) {
    const message = {
      _id: this._generateId(),
      sender: messageData.sender,
      receiver: messageData.receiver,
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      attachmentUrl: messageData.attachmentUrl || null,
      isRead: false,
      readAt: null,
      isDeleted: false,
      deletedBy: [],
      conversationId: MessageMock.generateConversationId(messageData.sender, messageData.receiver),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.messages.push(message);
    this._saveMessages();
    return message;
  }

  async findById(id) {
    return this.messages.find(msg => msg._id === id) || null;
  }

  async find(query = {}) {
    let results = [...this.messages];

    if (query.conversationId) {
      results = results.filter(msg => msg.conversationId === query.conversationId);
    }

    if (query.sender) {
      results = results.filter(msg => msg.sender === query.sender);
    }

    if (query.receiver) {
      results = results.filter(msg => msg.receiver === query.receiver);
    }

    if (query.isRead !== undefined) {
      results = results.filter(msg => msg.isRead === query.isRead);
    }

    return results;
  }

  async updateOne(query, update) {
    const index = this.messages.findIndex(msg => msg._id === query._id);
    
    if (index === -1) {
      return { modifiedCount: 0 };
    }

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
      this.messages[index].updatedAt = new Date().toISOString();
    }

    this._saveMessages();
    return { modifiedCount: 1 };
  }

  async deleteOne(query) {
    const index = this.messages.findIndex(msg => msg._id === query._id);
    
    if (index === -1) {
      return { deletedCount: 0 };
    }

    this.messages.splice(index, 1);
    this._saveMessages();
    return { deletedCount: 1 };
  }

  async countDocuments(query = {}) {
    let count = 0;
    
    this.messages.forEach(msg => {
      let matches = true;
      
      if (query.receiver && msg.receiver !== query.receiver) {
        matches = false;
      }
      
      if (query.isRead !== undefined && msg.isRead !== query.isRead) {
        matches = false;
      }

      if (query.deletedBy && query.deletedBy.$nin) {
        if (msg.deletedBy.includes(query.deletedBy.$nin[0])) {
          matches = false;
        }
      }
      
      if (matches) count++;
    });
    
    return count;
  }

  // Populate sender and receiver user info
  async populate(message, field) {
    // In a real implementation, this would fetch user data
    // For now, return the message as-is
    return message;
  }
}

module.exports = new MessageMock();
