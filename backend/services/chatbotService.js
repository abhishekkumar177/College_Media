/**
 * AI Study Buddy Chatbot Service
 * Provides intelligent icebreakers and conversation starters
 * for matched study buddies
 */

class StudyBuddyChatbot {
  constructor() {
    this.icebreakers = {
      courses: [
        "I noticed you're both taking {course}! What topic are you finding most interesting so far?",
        "Since you're both in {course}, have you started working on {topic} yet?",
        "I see {course} is a shared interest. What's your study strategy for the upcoming material?",
        "You're both enrolled in {course}! Have you found any good study resources for it?"
      ],
      interests: [
        "You both enjoy {interest}! How did you get started with that?",
        "I see {interest} is a common interest. Have you done any related projects?",
        "Since you're both into {interest}, what aspects do you find most fascinating?",
        "You share an interest in {interest}! Any recommendations for someone just starting out?"
      ],
      learningStyle: [
        "You both prefer {style} learning! What study techniques work best for you?",
        "I noticed you're both {style} learners. Have you tried any collaborative methods?",
        "Since you're both {style} learners, what's your ideal study environment?",
        "You both learn best through {style} methods. Any tips you'd recommend?"
      ],
      general: [
        "What motivated you to find a study buddy?",
        "What are your main academic goals this semester?",
        "How do you usually like to structure study sessions?",
        "What's been your biggest challenge academically so far?",
        "Are you working on any interesting projects right now?",
        "What's your preferred way to review material before exams?",
        "Do you prefer morning, afternoon, or evening study sessions?",
        "What study tools or apps do you find most helpful?"
      ]
    };

    this.studyTopics = [
      "exam preparation strategies",
      "note-taking methods",
      "time management techniques",
      "group study organization",
      "assignment collaboration",
      "concept explanation sessions",
      "practice problem solving",
      "project brainstorming"
    ];

    this.conversationStarters = [
      "Let me help break the ice! 🎉",
      "Great match! Let's get the conversation started.",
      "You two have a lot in common! Here's a question to get things going:",
      "This is an exciting match! Let me suggest a topic:",
      "I think you'll work great together! Let's start with:"
    ];
  }

  /**
   * Generate personalized icebreaker based on user compatibility data
   */
  generateIcebreaker(user1, user2, matchReasons = []) {
    const icebreakers = [];

    // Extract common courses
    const courses1 = (user1.courses || []).map(c => c.name || c);
    const courses2 = (user2.courses || []).map(c => c.name || c);
    const commonCourses = courses1.filter(c => 
      courses2.some(c2 => c2.toLowerCase() === c.toLowerCase())
    );

    // Generate course-based icebreakers
    if (commonCourses.length > 0) {
      const course = commonCourses[0];
      const templates = this.icebreakers.courses;
      const template = templates[Math.floor(Math.random() * templates.length)];
      icebreakers.push({
        type: 'course',
        message: template.replace('{course}', course).replace('{topic}', 'the latest chapter'),
        priority: 1
      });
    }

    // Extract common interests
    const interests1 = (user1.interests || []).map(i => i.toLowerCase());
    const interests2 = (user2.interests || []).map(i => i.toLowerCase());
    const commonInterests = interests1.filter(i => interests2.includes(i));

    // Generate interest-based icebreakers
    if (commonInterests.length > 0) {
      const interest = commonInterests[0];
      const templates = this.icebreakers.interests;
      const template = templates[Math.floor(Math.random() * templates.length)];
      icebreakers.push({
        type: 'interest',
        message: template.replace(/{interest}/g, interest),
        priority: 2
      });
    }

    // Generate learning style icebreakers
    if (user1.learningStyle && user2.learningStyle &&
        user1.learningStyle === user2.learningStyle) {
      const style = user1.learningStyle.replace(/_/g, ' ');
      const templates = this.icebreakers.learningStyle;
      const template = templates[Math.floor(Math.random() * templates.length)];
      icebreakers.push({
        type: 'learningStyle',
        message: template.replace(/{style}/g, style),
        priority: 3
      });
    }

    // Add general icebreakers
    const generalTemplate = this.icebreakers.general[
      Math.floor(Math.random() * this.icebreakers.general.length)
    ];
    icebreakers.push({
      type: 'general',
      message: generalTemplate,
      priority: 4
    });

    // Sort by priority and return top 3
    icebreakers.sort((a, b) => a.priority - b.priority);
    return icebreakers.slice(0, 3).map(ib => ib.message);
  }

  /**
   * Generate study topic suggestions
   */
  generateStudyTopics(user1, user2) {
    const suggestions = [];

    // Course-specific topics
    const courses1 = (user1.courses || []).map(c => c.name || c);
    const courses2 = (user2.courses || []).map(c => c.name || c);
    const commonCourses = courses1.filter(c => 
      courses2.some(c2 => c2.toLowerCase() === c.toLowerCase())
    );

    commonCourses.forEach(course => {
      suggestions.push({
        topic: `${course} - Exam Preparation`,
        description: `Review key concepts and practice problems for ${course}`,
        course: course
      });
      suggestions.push({
        topic: `${course} - Assignment Collaboration`,
        description: `Work together on ${course} assignments and projects`,
        course: course
      });
    });

    // General study topics
    const generalTopics = this.studyTopics
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    generalTopics.forEach(topic => {
      suggestions.push({
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        description: `Discuss and share strategies for ${topic}`,
        course: null
      });
    });

    return suggestions;
  }

  /**
   * Generate welcome message for matched users
   */
  generateWelcomeMessage(user1, user2, compatibilityScore, matchReasons = []) {
    const starter = this.conversationStarters[
      Math.floor(Math.random() * this.conversationStarters.length)
    ];

    let message = `${starter}\n\n`;
    message += `🎯 Compatibility Score: ${compatibilityScore}%\n\n`;

    if (matchReasons.length > 0) {
      message += `Why you matched:\n`;
      matchReasons.slice(0, 3).forEach(reason => {
        message += `• ${reason}\n`;
      });
      message += '\n';
    }

    const icebreakers = this.generateIcebreaker(user1, user2, matchReasons);
    if (icebreakers.length > 0) {
      message += `💡 Conversation starters:\n`;
      icebreakers.forEach((ib, index) => {
        message += `${index + 1}. ${ib}\n`;
      });
    }

    return message;
  }

  /**
   * Generate study session plan
   */
  generateStudyPlan(user1, user2) {
    const courses1 = (user1.courses || []).map(c => c.name || c);
    const courses2 = (user2.courses || []).map(c => c.name || c);
    const commonCourses = courses1.filter(c => 
      courses2.some(c2 => c2.toLowerCase() === c.toLowerCase())
    );

    const plan = {
      title: 'Suggested Study Session Plan',
      duration: '2-3 hours',
      activities: []
    };

    // Add common course reviews
    if (commonCourses.length > 0) {
      plan.activities.push({
        activity: `Review ${commonCourses[0]}`,
        duration: '45-60 minutes',
        description: 'Go through key concepts, discuss difficult topics, and quiz each other'
      });
    }

    // Add practice problems
    plan.activities.push({
      activity: 'Practice Problems',
      duration: '30-45 minutes',
      description: 'Work through practice problems together, explain solutions to each other'
    });

    // Add break
    plan.activities.push({
      activity: 'Break',
      duration: '15 minutes',
      description: 'Take a short break to refresh'
    });

    // Add review session
    plan.activities.push({
      activity: 'Concept Review & Discussion',
      duration: '30 minutes',
      description: 'Review what you learned, discuss any remaining questions'
    });

    return plan;
  }

  /**
   * Provide conversation tips
   */
  getConversationTips() {
    return [
      "Be open and friendly - remember, they're looking for a study partner too!",
      "Share your study goals and challenges openly",
      "Ask about their preferred study methods and schedule",
      "Suggest a specific time and place for your first study session",
      "Exchange contact information for easier coordination",
      "Start with a trial study session to see if you work well together",
      "Be respectful of different learning styles and paces",
      "Set clear expectations about communication and commitment"
    ];
  }

  /**
   * Generate smart reply suggestions
   */
  generateSmartReplies(lastMessage, context = {}) {
    const message = lastMessage.toLowerCase();
    
    // Question about meeting
    if (message.includes('when') || message.includes('meet') || message.includes('study session')) {
      return [
        "How about this week? I'm free on [your available days]",
        "I'm flexible! What works best for your schedule?",
        "Let's start with a 2-hour session. Does that sound good?"
      ];
    }

    // Question about location
    if (message.includes('where') || message.includes('location') || message.includes('place')) {
      return [
        "The library usually works great for me. How about you?",
        "I'm open to suggestions! Campus coffee shop or library?",
        "I prefer quiet places like study rooms. Any preferences?"
      ];
    }

    // Question about subject/course
    if (message.includes('subject') || message.includes('course') || message.includes('class')) {
      return [
        "I'm currently focusing on [course name]. How about you?",
        "I need help with [topic]. Maybe we can work on that together?",
        "I'm strongest in [subject]. Happy to help with that!"
      ];
    }

    // Generic positive responses
    return [
      "That sounds great! Let's make it happen.",
      "I'm excited to study together!",
      "Perfect! Let me know what works for you.",
      "Absolutely! Looking forward to it."
    ];
  }

  /**
   * Detect if conversation needs help/moderation
   */
  needsModerationHelp(messages) {
    if (messages.length === 0) return false;
    
    // Check if conversation is stalling (long gaps with short messages)
    const recentMessages = messages.slice(-5);
    if (recentMessages.length >= 5) {
      const avgLength = recentMessages.reduce((sum, msg) => 
        sum + (msg.content || '').length, 0) / recentMessages.length;
      
      if (avgLength < 20) {
        return {
          help: true,
          suggestion: "It looks like the conversation might need a boost! Try asking about specific study topics or suggesting a time to meet."
        };
      }
    }

    return { help: false };
  }

  /**
   * Generate follow-up suggestions after initial chat
   */
  generateFollowUp(conversationLength) {
    if (conversationLength < 5) {
      return "Great start! Consider sharing more about your study goals and schedule.";
    } else if (conversationLength < 10) {
      return "You're making progress! Ready to plan your first study session?";
    } else {
      return "Looks like you're connecting well! Don't forget to exchange contact info and set up a study time.";
    }
  }
}

// Singleton instance
const studyBuddyChatbot = new StudyBuddyChatbot();

module.exports = studyBuddyChatbot;
