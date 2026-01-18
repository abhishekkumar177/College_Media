import React, { useState, useEffect, useRef } from 'react';
import './AIChatWindow.css';

interface Match {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    courses?: Array<{ name: string } | string>;
    skills?: string[];
    interests?: string[];
    learningStyle?: string;
  };
  compatibilityScore: number;
  matchReasons: string[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'buddy';
  content: string;
  timestamp: Date;
}

interface AIChatWindowProps {
  match: Match;
  onClose: () => void;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ match, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate AI welcome message
    generateWelcomeMessage();
  }, [match]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: `🎉 Congratulations! You both liked each other!\n\n` +
               `🎯 Compatibility Score: ${match.compatibilityScore}%\n\n` +
               `Why you matched:\n${match.matchReasons.map(r => `• ${r}`).join('\n')}\n\n` +
               `I'm your AI Study Buddy Assistant! I'll help facilitate your conversation. ` +
               `Here are some conversation starters to get you going:`,
      timestamp: new Date()
    };

    setMessages([welcomeMsg]);

    // Generate icebreakers
    setTimeout(() => {
      const icebreakers = generateIcebreakers();
      setSuggestions(icebreakers);
    }, 500);
  };

  const generateIcebreakers = (): string[] => {
    const icebreakers: string[] = [];

    // Course-based
    if (match.user.courses && match.user.courses.length > 0) {
      const course = typeof match.user.courses[0] === 'string' 
        ? match.user.courses[0] 
        : match.user.courses[0].name;
      icebreakers.push(`I noticed you're taking ${course}. What topics are you finding most interesting?`);
    }

    // Interest-based
    if (match.user.interests && match.user.interests.length > 0) {
      icebreakers.push(`I see we both enjoy ${match.user.interests[0]}! How did you get started with that?`);
    }

    // Learning style
    if (match.user.learningStyle) {
      const style = match.user.learningStyle.replace(/_/g, ' ');
      icebreakers.push(`Since we're both ${style} learners, what study techniques work best for you?`);
    }

    // General
    icebreakers.push('What motivated you to find a study buddy?');
    icebreakers.push('How do you usually like to structure your study sessions?');

    return icebreakers.slice(0, 4);
  };

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      provideAIFeedback(text);
    }, 1000);
  };

  const provideAIFeedback = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const feedback = generateSmartReply(userMessage);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: feedback,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update suggestions
      if (messages.length < 5) {
        setSuggestions(generateContextualSuggestions(userMessage));
      } else {
        setSuggestions([]);
      }
    }, 1500);
  };

  const generateSmartReply = (message: string): string => {
    const msg = message.toLowerCase();

    if (msg.includes('when') || msg.includes('meet') || msg.includes('time')) {
      return '💡 Great! You\'re discussing meeting times. Don\'t forget to:\n' +
             '• Share your available time slots\n' +
             '• Suggest a specific location\n' +
             '• Agree on session duration (2-3 hours works well)';
    }

    if (msg.includes('where') || msg.includes('location') || msg.includes('place')) {
      return '📍 Perfect! Here are some good study locations:\n' +
             '• Library study rooms (quiet, focused)\n' +
             '• Campus coffee shops (relaxed atmosphere)\n' +
             '• Online video call (flexible, convenient)';
    }

    if (msg.includes('subject') || msg.includes('course') || msg.includes('help')) {
      return '📚 Discussing courses and study needs is key! Make sure to:\n' +
             '• Identify overlapping courses\n' +
             '• Share your strengths and challenges\n' +
             '• Discuss specific topics you want to cover';
    }

    if (msg.includes('schedule') || msg.includes('available')) {
      return '⏰ Scheduling tip: Use a shared calendar or scheduling tool for easy coordination!';
    }

    return '👍 Good communication! Keep sharing and asking questions to build a strong study partnership.';
  };

  const generateContextualSuggestions = (lastMessage: string): string[] => {
    const msg = lastMessage.toLowerCase();

    if (msg.includes('when') || msg.includes('time')) {
      return [
        'I\'m free on weekday afternoons. How about you?',
        'Let\'s start with a 2-hour session this week?',
        'What days work best for your schedule?'
      ];
    }

    if (msg.includes('where') || msg.includes('location')) {
      return [
        'The library works great for me!',
        'How about we meet at the campus coffee shop?',
        'I prefer online sessions. Would video chat work for you?'
      ];
    }

    return [
      'That sounds perfect!',
      'I\'m excited to start studying together!',
      'Let\'s exchange contact information.'
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStudyPlanSuggestion = () => {
    return {
      title: 'Suggested Study Session Plan',
      duration: '2-3 hours',
      activities: [
        { activity: 'Introduction & Goals', duration: '15 min' },
        { activity: 'Review Course Material', duration: '45-60 min' },
        { activity: 'Practice Problems', duration: '30-45 min' },
        { activity: 'Break', duration: '15 min' },
        { activity: 'Discussion & Q&A', duration: '30 min' }
      ]
    };
  };

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-window">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <div className="match-avatar">
              {match.user.profilePicture ? (
                <img src={match.user.profilePicture} alt={match.user.name} />
              ) : (
                <div className="default-avatar-small">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <div>
              <h3>{match.user.name}</h3>
              <p className="compatibility-mini">
                <i className="fas fa-heart"></i>
                {match.compatibilityScore}% Match
              </p>
            </div>
          </div>
          <button className="btn-close-chat" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message message-${message.sender}`}
            >
              {message.sender === 'ai' && (
                <div className="message-avatar ai-avatar">
                  <i className="fas fa-robot"></i>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message message-ai">
              <div className="message-avatar ai-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="chat-suggestions">
            <p className="suggestions-label">
              <i className="fas fa-lightbulb"></i> Try saying:
            </p>
            <div className="suggestion-chips">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan Helper */}
        {messages.length >= 3 && (
          <div className="study-plan-hint">
            <button 
              className="btn-study-plan"
              onClick={() => {
                const plan = getStudyPlanSuggestion();
                const planMessage = `📋 ${plan.title}\n\n` +
                  `Duration: ${plan.duration}\n\n` +
                  plan.activities.map(a => `• ${a.activity} (${a.duration})`).join('\n');
                
                const aiMsg: Message = {
                  id: Date.now().toString(),
                  sender: 'ai',
                  content: planMessage,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
              }}
            >
              <i className="fas fa-calendar-alt"></i>
              Get Study Plan Suggestion
            </button>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className="btn-send"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatWindow;
