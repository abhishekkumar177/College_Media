import React, { useState } from 'react'
import SEO from '../components/Seo'
import conversations from '../mock/conversations'

function Messages() {
  const [activeConversationId, setActiveConversationId] = useState(null);

  const activeConversation = conversations.find(
    c => c.id === activeConversationId
  );

  return (
    <>
      <SEO 
        title="Messages - UniHub"
        description="Stay connected with your college community through direct messages on UniHub."
        keywords="college messages, student chat, campus communication, direct messages"
      />
      
      <div className="flex h-[calc(100vh-64px)] bg-white">
        {/* Conversations Sidebar */}
        <div className={`w-full lg:w-1/3 border-r border-gray-200 flex flex-col ${activeConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                  activeConversationId === conv.id ? "bg-purple-100 border-l-4 border-l-purple-500" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <img 
                    src={conv.user.avatar} 
                    alt={conv.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {conv.user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.messages.at(-1)?.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Chat Area */}
        <div className={`flex-1 flex flex-col ${activeConversationId ? 'flex' : 'hidden lg:flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                <div className="flex items-center space-x-3">
                  {/* Back Button (Mobile Only) */}
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Back to conversations"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                  
                  <img 
                    src={activeConversation.user.avatar} 
                    alt={activeConversation.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {activeConversation.user.name}
                    </h3>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {activeConversation.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex flex-col max-w-xs">
                        <div
                          className={`p-3 rounded-lg ${
                            msg.sender === "me"
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <span className={`text-xs text-gray-400 mt-1 ${
                          msg.sender === "me" ? "text-right" : "text-left"
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                  <button
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Message sending is not yet available (UI mockup only)
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Messages
