import React, { useState, useEffect, useRef } from 'react'
import SEO from '../components/Seo'
import { messagesApi } from '../api/endpoints'

function Messages() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (userId) => {
    try {
      const response = await messagesApi.getConversation(userId);
      if (response.data.success) {
        setMessages(response.data.data.messages.reverse());
        // Mark all as read
        await messagesApi.markAllAsRead(userId);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await messagesApi.send({
        receiver: activeConversationId,
        content: messageInput.trim(),
        messageType: 'text'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data]);
        setMessageInput('');
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get active conversation details
  const activeConversation = conversations.find(
    c => c.otherUserId === activeConversationId || c.otherUser?._id === activeConversationId
  );

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <SEO 
        title="Messages - UniHub"
        description="Stay connected with your college community through direct messages on UniHub."
        keywords="college messages, student chat, campus communication, direct messages"
      />
      
      <div className="flex flex-col h-[calc(100vh-180px)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Messages</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className={`w-full lg:w-2/5 border-r border-gray-200 dark:border-slate-700 flex flex-col ${activeConversationId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-slate-400">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-slate-400">No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const otherUser = conv.otherUser || { firstName: 'User', lastName: '', profilePicture: null };
                  const userId = conv.otherUserId || conv.otherUser?._id;
                  
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => setActiveConversationId(userId)}
                      className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                        activeConversationId === userId ? "bg-purple-100 dark:bg-slate-800 border-l-4 border-l-purple-500" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                        </div>
                        
                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">
                              {otherUser.firstName} {otherUser.lastName}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className={`flex-1 flex flex-col ${activeConversationId ? 'flex' : 'hidden lg:flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-3">
                  {/* Back Button (Mobile Only) */}
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    aria-label="Back to conversations"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {activeConversation?.otherUser?.firstName?.[0]}{activeConversation?.otherUser?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                      {activeConversation?.otherUser?.firstName} {activeConversation?.otherUser?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {activeConversation?.otherUser?.username || 'User'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-800">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isSentByMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex flex-col max-w-xs">
                            <div
                              className={`p-3 rounded-lg ${
                                isSentByMe
                                  ? "bg-purple-500 text-white rounded-br-none"
                                  : "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-600 rounded-bl-none"
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                            </div>
                            <span className={`text-xs text-gray-400 dark:text-slate-500 mt-1 ${
                              isSentByMe ? "text-right" : "text-left"
                            }`}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                {error && (
                  <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={sendingMessage || !messageInput.trim()}
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
              <div className="text-center">
                <p className="text-gray-500 dark:text-slate-400 text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  )
}

export default Messages
