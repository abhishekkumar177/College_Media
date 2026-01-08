import React, { useState } from 'react';

/**
 * SupportFAQ Component
 * 
 * Displays frequently asked questions to help users find answers
 * quickly before contacting support.
 * 
 * Features:
 * - Accordion-style FAQ items
 * - Accessible keyboard navigation
 * - Category-based organization
 * - Quick links to relevant sections
 * 
 * @component
 * @returns {React.ReactElement} FAQ accordion with common questions
 */
const SupportFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'Go to the login page and click "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link. The link expires in 24 hours for security.',
      category: 'Account',
    },
    {
      question: 'How can I change my profile information?',
      answer:
        'Navigate to Settings > Edit Profile. From there, you can update your name, bio, profile picture, and other account details. Changes are saved automatically.',
      category: 'Account',
    },
    {
      question: 'How do I report inappropriate content?',
      answer:
        'Click the three dots (⋯) on any post, then select "Report". Choose the reason for reporting and submit. Our moderation team reviews all reports within 24 hours.',
      category: 'Safety',
    },
    {
      question: 'Why can\'t I see posts from certain users?',
      answer:
        'The user may have a private account, or you might have been blocked. You can also check if they\'ve deactivated their account temporarily.',
      category: 'Privacy',
    },
    {
      question: 'How do I delete my account?',
      answer:
        'Go to Settings > Danger Zone > Delete Account. Please note that this action is permanent and cannot be undone. Your data will be removed within 30 days.',
      category: 'Account',
    },
    {
      question: 'Is my data secure on UniHub?',
      answer:
        'Yes! We use industry-standard encryption for all data transfers and storage. We never share your personal information with third parties without your consent.',
      category: 'Privacy',
    },
    {
      question: 'How do I contact support for urgent issues?',
      answer:
        'For urgent issues like account security concerns or harassment, please use the contact form with the "Account Help" category and mention "URGENT" in the subject line.',
      category: 'Support',
    },
    {
      question: 'What is the typical response time for support inquiries?',
      answer:
        'Our support team typically responds within 24-48 hours. Urgent security-related issues are prioritized and usually addressed within 12 hours.',
      category: 'Support',
    },
  ];

  /**
   * Toggle FAQ item open/closed
   * @param {number} index - Index of FAQ item to toggle
   */
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Find quick answers to common questions before reaching out.
      </p>

      <div className="space-y-3" role="list" aria-label="Frequently asked questions">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl overflow-hidden"
            role="listitem"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {faq.category}
                </span>
                <span className="font-medium text-gray-900">{faq.question}</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'max-h-48' : 'max-h-0'
              }`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
            >
              <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links Section */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/settings"
            className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            <span>⚙️</span>
            Account Settings
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            <span>📜</span>
            Community Guidelines
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            <span>🔒</span>
            Privacy Policy
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            <span>📋</span>
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportFAQ;
